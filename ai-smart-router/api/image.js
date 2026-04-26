const { checkAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");
const { routeChat, fetchFreeOpenRouterModels } = require("../lib/router");

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Mots-clés pour identifier les modèles d'image gratuits sur OpenRouter. */
const IMAGE_KEYWORDS = ["dall-e", "flux", "sdxl", "stable-diffusion", "image"];

function isImageModel(modelId) {
  const lower = modelId.toLowerCase();
  return IMAGE_KEYWORDS.some((kw) => lower.includes(kw));
}

async function generateWithOpenRouter(apiKey, model, prompt) {
  const response = await fetch(OPENROUTER_IMAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://darkmedia-x.studio",
      "X-Title": "DarkMedia-X Studio",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const urlMatch = content.match(/https?:\/\/[^\s)]+/);
  const imageUrl = urlMatch ? urlMatch[0] : content || null;

  if (!imageUrl) {
    throw new Error("Aucune image générée dans la réponse.");
  }

  return { imageUrl, provider: "openrouter", model };
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Client-Key, X-Signature, X-Timestamp");
  applySecurityHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (!checkAuth(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Méthode non autorisée. Utilisez POST.", 405, "METHOD_NOT_ALLOWED");
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return sendError(res, "Body JSON invalide.", 400, "INVALID_JSON");
  }

  const { prompt, model, enhance } = body;
  if (!prompt) {
    return sendError(res, "Le champ 'prompt' est requis.", 400, "VALIDATION_ERROR", { field: "prompt", reason: "required" });
  }

  let finalPrompt = prompt;

  // Enhancement via OpenRouter chat (si activé)
  if (enhance) {
    try {
      const enhanceResult = await routeChat({
        messages: [
          { role: "user", content: `Enrichis ce prompt pour une image d'horreur DarkMedia-X (style Junji Ito, sombre, détaillé) : "${prompt}". Réponds uniquement avec le prompt enrichi en anglais.` }
        ],
      });
      finalPrompt = enhanceResult.text || prompt;
      console.log(`[Images] Prompt enrichi: ${finalPrompt}`);
    } catch (e) {
      console.warn("[Images] Échec de l'enrichissement, utilisation du prompt original.");
    }
  }

  let lastErr = null;
  let replicateUnauthorized = false;

  // 1. Essayer Replicate d'abord (modèles gratuits en priorité)
  if (REPLICATE_API_KEY) {
    try {
      const replicate = require("../lib/providers/replicate");
      console.log(`[api/image] Tentative Replicate (gratuits d'abord)...`);
      const result = await replicate.generateImage({
        apiKey: REPLICATE_API_KEY,
        model,
        prompt: finalPrompt,
      });
      return sendSuccess(res, result, `Image générée avec succès (replicate - ${result.model})`);
    } catch (err) {
      if (err.message === "REPLICATE_UNAUTHORIZED") {
        replicateUnauthorized = true;
        console.warn(`[api/image] Replicate clé invalide (401), skip vers OpenRouter...`);
      } else {
        lastErr = err;
        console.warn(`[api/image] Échec Replicate:`, err.message);
      }
    }
  }

  // 2. Fallback sur OpenRouter
  if (OPENROUTER_API_KEY) {
    try {
      const payantModel = model || "openai/dall-e-3";
      const allFreeModels = await fetchFreeOpenRouterModels();
      const freeImageModels = allFreeModels.filter(isImageModel);
      const modelsToTry = [...freeImageModels];
      if (!modelsToTry.includes(payantModel)) modelsToTry.push(payantModel);

      for (const m of modelsToTry) {
        try {
          console.log(`[api/image] Tentative OpenRouter (${m})...`);
          const result = await generateWithOpenRouter(OPENROUTER_API_KEY, m, finalPrompt);
          return sendSuccess(res, result, `Image générée avec succès (${m})`);
        } catch (err2) {
          console.warn(`[api/image] Échec OpenRouter ${m}:`, err2.message);
        }
      }
    } catch (err) {
      lastErr = err;
    }
  }

  return sendError(
    res,
    lastErr?.message || "Aucun provider d'image configuré (REPLICATE_API_KEY ou OPENROUTER_API_KEY manquant)",
    503
  );
};

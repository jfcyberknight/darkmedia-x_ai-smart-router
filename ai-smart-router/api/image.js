const { checkApiSecret, checkClientAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");
const { routeChat, fetchFreeOpenRouterModels } = require("../lib/router");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Mots-clés pour identifier les modèles d'image gratuits sur OpenRouter. */
const IMAGE_KEYWORDS = ["dall-e", "flux", "sdxl", "stable-diffusion", "image"];

function isImageModel(modelId) {
  const lower = modelId.toLowerCase();
  return IMAGE_KEYWORDS.some((kw) => lower.includes(kw));
}

async function generateImageWithModel(apiKey, model, prompt) {
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

  const hasClientKey = req.headers["x-client-key"];
  if (hasClientKey) {
    if (!checkClientAuth(req, res)) return;
  } else {
    if (!checkApiSecret(req, res)) return;
  }

  if (req.method !== "POST") {
    return sendError(res, "Méthode non autorisée. Utilisez POST.", 405);
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return sendError(res, "Body JSON invalide.", 400);
  }

  const { prompt, model, enhance } = body;
  if (!prompt) {
    return sendError(res, "Le champ 'prompt' est requis.", 400);
  }

  if (!OPENROUTER_API_KEY) {
    return sendError(res, "OPENROUTER_API_KEY non configuré.", 503);
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

  try {
    const payantModel = model || "openai/dall-e-3";

    // Récupérer les modèles gratuits et filtrer ceux d'image
    const allFreeModels = await fetchFreeOpenRouterModels();
    const freeImageModels = allFreeModels.filter(isImageModel);

    // Construire l'ordre : gratuits image > modèle payant
    const modelsToTry = [...freeImageModels];
    if (!modelsToTry.includes(payantModel)) {
      modelsToTry.push(payantModel);
    }

    let lastErr = null;
    for (const m of modelsToTry) {
      try {
        console.log(`[api/image] Tentative avec ${m}...`);
        const result = await generateImageWithModel(OPENROUTER_API_KEY, m, finalPrompt);
        return sendSuccess(res, result, `Image générée avec succès (${m})`);
      } catch (err) {
        lastErr = err;
        console.warn(`[api/image] Échec ${m}:`, err.message);
      }
    }

    throw lastErr || new Error("Tous les modèles d'image ont échoué.");
  } catch (err) {
    console.error("[api/image]", err.message);
    return sendError(res, err.message || "Erreur lors de la génération d'image.", 500);
  }
};

const { checkApiSecret, checkClientAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");

const FAL_KEY = process.env.FAL_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const DEFAULT_FAL_MODEL = "fal-ai/fast-svd-lcm";

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

  const { prompt, image_url, model, enhance } = body;
  if (!prompt && !image_url) {
    return sendError(res, "Champ 'prompt' ou 'image_url' requis.", 400);
  }

  let finalPrompt = prompt || "";
  if (enhance && finalPrompt) {
    try {
      const groqProvider = require("../lib/providers/groq");
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const enhanceMsg = [{ role: "user", content: `Enrichis ce prompt pour une vidéo d'horreur DarkMedia-X (style cinématographique, sombre, atmos-phérique) : "${finalPrompt}". Réponds uniquement avec le prompt enrichi en anglais.` }];
        const enhanced = await groqProvider.generate({ apiKey: groqKey, messages: enhanceMsg });
        finalPrompt = enhanced.text || finalPrompt;
        console.log(`[Video] Prompt enrichi par GROQ: ${finalPrompt}`);
      }
    } catch (e) {
      console.warn("[Video] Échec de l'enrichissement GROQ, utilisation du prompt original.");
    }
  }

  try {
    const { default: fetch } = await import("node-fetch");
    let result;
    let usedProvider = "";

    if (!FAL_KEY) {
      return sendError(res, "Aucune API vidéo configurée. Définissez FAL_KEY.", 503);
    }

    const modelPath = model || DEFAULT_FAL_MODEL;
    console.log(`[api/video] Tentative avec Fal.ai (${modelPath})`);
    const falResponse = await fetch(`https://fal.run/${modelPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${FAL_KEY}`,
      },
      body: JSON.stringify({
        ...(finalPrompt && { prompt: finalPrompt }),
        ...(image_url && { image_url }),
      }),
    });

    if (falResponse.ok) {
      const data = await falResponse.json();
      const videoUrl = data.video?.url || data.videos?.[0]?.url || data.url;
      if (!videoUrl) {
        console.error("[api/video] Réponse Fal.ai brute:", JSON.stringify(data));
        throw new Error("Aucune URL vidéo générée dans la réponse Fal.ai.");
      }
      result = { videoUrl, provider: "fal", model: modelPath };
      usedProvider = "fal";
    } else {
      const err = await falResponse.text();
      console.warn("[api/video] Fal.ai error:", err);
      throw new Error(`Fal.ai: ${err}`);
    }

    return sendSuccess(res, result, `Vidéo générée avec succès (${usedProvider})`);
  } catch (err) {
    console.error("[api/video]", err.message);
    return sendError(res, err.message || "Erreur lors de la génération vidéo.", 500);
  }
};

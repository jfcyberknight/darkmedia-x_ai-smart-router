const { checkAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");
const { routeChat } = require("../lib/router");

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const FAL_KEY = process.env.FAL_KEY;

const DEFAULT_FAL_MODEL = "fal-ai/fast-svd-lcm";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Client-Key, X-Signature, X-Timestamp");
  applySecurityHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (!checkAuth(req, res)) return;

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
      const enhanceResult = await routeChat({
        messages: [
          { role: "user", content: `Enrichis ce prompt pour une vidéo d'horreur DarkMedia-X (style cinématographique, sombre, atmosphérique) : "${finalPrompt}". Réponds uniquement avec le prompt enrichi en anglais.` }
        ],
      });
      finalPrompt = enhanceResult.text || finalPrompt;
      console.log(`[Video] Prompt enrichi: ${finalPrompt}`);
    } catch (e) {
      console.warn("[Video] Échec de l'enrichissement, utilisation du prompt original.");
    }
  }

  let lastErr = null;

  // 1. Essayer Replicate d'abord (modèles gratuits en priorité)
  if (REPLICATE_API_KEY) {
    try {
      const replicate = require("../lib/providers/replicate");
      console.log(`[api/video] Tentative Replicate (gratuits d'abord)...`);
      const result = await replicate.generateVideo({
        apiKey: REPLICATE_API_KEY,
        model,
        prompt: finalPrompt,
        image_url,
      });
      return sendSuccess(res, result, `Vidéo générée avec succès (replicate - ${result.model})`);
    } catch (err) {
      lastErr = err;
      console.warn(`[api/video] Échec Replicate:`, err.message);
    }
  }

  // 2. Fallback sur Fal.ai
  if (FAL_KEY) {
    try {
      const modelPath = model || DEFAULT_FAL_MODEL;
      console.log(`[api/video] Tentative Fal.ai (${modelPath})...`);
      const { default: fetch } = await import("node-fetch");
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

      if (!falResponse.ok) {
        const err = await falResponse.text();
        throw new Error(`Fal.ai: ${err}`);
      }

      const data = await falResponse.json();
      const videoUrl = data.video?.url || data.videos?.[0]?.url || data.url;
      if (!videoUrl) {
        throw new Error("Aucune URL vidéo générée dans la réponse Fal.ai.");
      }

      return sendSuccess(
        res,
        { videoUrl, provider: "fal", model: modelPath },
        `Vidéo générée avec succès (fal)`
      );
    } catch (err) {
      lastErr = err;
      console.warn(`[api/video] Échec Fal.ai:`, err.message);
    }
  }

  return sendError(
    res,
    lastErr?.message || "Aucun provider vidéo configuré (REPLICATE_API_KEY ou FAL_KEY manquant)",
    503
  );
};

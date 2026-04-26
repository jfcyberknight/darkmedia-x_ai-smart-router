const { checkAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");
const { fetchFreeOpenRouterModels } = require("../lib/router");

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_TTS_URL = "https://openrouter.ai/api/v1/tts";

/** Mots-clés pour identifier les modèles TTS gratuits sur OpenRouter. */
const TTS_KEYWORDS = ["tts", "speech", "audio", "elevenlabs", "cartesia", "sonic", "openai/audio"];

function isTtsModel(modelId) {
  const lower = modelId.toLowerCase();
  return TTS_KEYWORDS.some((kw) => lower.includes(kw));
}

async function generateWithOpenRouter(apiKey, model, text, voice) {
  const response = await fetch(OPENROUTER_TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://darkmedia-x.studio",
      "X-Title": "DarkMedia-X Studio",
    },
    body: JSON.stringify({
      input: text,
      model,
      voice: voice || "alloy",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${response.status} ${err}`);
  }

  const audioBuffer = await response.buffer();
  return {
    audio: audioBuffer.toString("base64"),
    contentType: "audio/mp3",
    provider: "openrouter",
    model,
  };
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

  const { text, voice, model } = body;
  if (!text || typeof text !== "string") {
    return sendError(res, "Champ 'text' requis (string).", 400, "VALIDATION_ERROR", { field: "text", reason: "required" });
  }
  if (text.length > 1000) {
    return sendError(res, "Texte trop long (max 1000 caractères).", 400, "VALIDATION_ERROR", { field: "text", reason: "too_long", max: 1000 });
  }

  let lastErr = null;
  let replicateUnauthorized = false;

  // 1. Essayer Replicate d'abord (modèles gratuits en priorité)
  if (REPLICATE_API_KEY) {
    try {
      const replicate = require("../lib/providers/replicate");
      console.log(`[api/tts] Tentative Replicate (gratuits d'abord)...`);
      const result = await replicate.generateTts({
        apiKey: REPLICATE_API_KEY,
        model,
        text,
        voice,
      });
      return sendSuccess(
        res,
        { audio: result.audio, contentType: result.contentType },
        `Audio généré avec succès (replicate - ${result.model})`
      );
    } catch (err) {
      if (err.message === "REPLICATE_UNAUTHORIZED") {
        replicateUnauthorized = true;
        console.warn(`[api/tts] Replicate clé invalide (401), skip vers OpenRouter...`);
      } else {
        lastErr = err;
        console.warn(`[api/tts] Échec Replicate:`, err.message);
      }
    }
  }

  // 2. Fallback sur OpenRouter
  if (OPENROUTER_API_KEY) {
    try {
      const payantModel = model || "elevenlabs/eleven-turbo-v2";
      const allFreeModels = await fetchFreeOpenRouterModels();
      const freeTtsModels = allFreeModels.filter(isTtsModel);
      const modelsToTry = [...freeTtsModels];
      if (!modelsToTry.includes(payantModel)) modelsToTry.push(payantModel);

      for (const m of modelsToTry) {
        try {
          console.log(`[api/tts] Tentative OpenRouter (${m})...`);
          const result = await generateWithOpenRouter(OPENROUTER_API_KEY, m, text, voice);
          return sendSuccess(
            res,
            { audio: result.audio, contentType: result.contentType },
            `Audio généré avec succès (${m})`
          );
        } catch (err2) {
          console.warn(`[api/tts] Échec OpenRouter ${m}:`, err2.message);
        }
      }
    } catch (err) {
      lastErr = err;
    }
  }

  return sendError(
    res,
    lastErr?.message || "Aucun provider TTS configuré (REPLICATE_API_KEY ou OPENROUTER_API_KEY manquant)",
    503
  );
};

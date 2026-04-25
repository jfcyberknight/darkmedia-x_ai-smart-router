const { checkApiSecret, checkClientAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");

const COQUI_URL = process.env.TTS_API_URL || "https://app.coqui.ai/api/v2/samples";
const COQUI_API_KEY = process.env.TTS_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

const OPENROUTER_TTS_URL = "https://openrouter.ai/api/v1/tts";
const TOGETHER_TTS_URL = "https://api.together.ai/v1/audio/speech";

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

  const { text, voice, model } = body;
  if (!text || typeof text !== "string") {
    return sendError(res, "Champ 'text' requis (string).", 400);
  }
  if (text.length > 1000) {
    return sendError(res, "Texte trop long (max 1000 caractères).", 400);
  }

  try {
    const { default: fetch } = await import("node-fetch");
    let audioBase64;
    let contentType = "audio/mp3";

    if (ELEVENLABS_API_KEY) {
      const voiceId = voice || "pNInz6obpgDQGcFmaJgB";
      const elevenResponse = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85,
            style: 0.6,
          },
        }),
      });

      if (elevenResponse.ok) {
        const audioBuffer = await elevenResponse.buffer();
        audioBase64 = audioBuffer.toString("base64");
      } else {
        const err = await elevenResponse.text();
        console.error("[api/tts] ElevenLabs error:", err);
        return sendError(res, "Erreur ElevenLabs: " + err, 502);
      }
    } else if (TOGETHER_API_KEY) {
      const ttsModel = model || "cartesia/sonic-2";
      const ttsVoice = voice || "tara";

      const togetherResponse = await fetch(TOGETHER_TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + TOGETHER_API_KEY,
        },
        body: JSON.stringify({
          input: text,
          model: ttsModel,
          voice: ttsVoice,
          response_format: "mp3",
        }),
      });

      if (togetherResponse.ok) {
        const audioBuffer = await togetherResponse.buffer();
        audioBase64 = audioBuffer.toString("base64");
      } else {
        const err = await togetherResponse.text();
        console.error("[api/tts] Together error:", err);
        return sendError(res, "Erreur Together: " + err, 502);
      }
    } else if (OPENROUTER_API_KEY) {
      const ttsModel = model || "elevenlabs/eleven-turbo-v2";
      const ttsVoice = voice || "alloy";

      const openrouterResponse = await fetch(OPENROUTER_TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + OPENROUTER_API_KEY,
          "HTTP-Referer": "https://darkmedia-x.studio",
          "X-Title": "DarkMedia-X Studio",
        },
        body: JSON.stringify({
          input: text,
          model: ttsModel,
          voice: ttsVoice,
        }),
      });

      if (openrouterResponse.ok) {
        const audioBuffer = await openrouterResponse.buffer();
        audioBase64 = audioBuffer.toString("base64");
      } else {
        const err = await openrouterResponse.text();
        console.error("[api/tts] OpenRouter error:", err);
        return sendError(res, "Erreur OpenRouter: " + err, 502);
      }
    } else if (COQUI_API_KEY && COQUI_URL) {
      const coquiResponse = await fetch(COQUI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + COQUI_API_KEY,
        },
        body: JSON.stringify({
          text,
          voice_id: voice,
        }),
      });

      if (coquiResponse.ok) {
        const data = await coquiResponse.json();
        audioBase64 = data.audio || data.sample?.audio;
        contentType = data.contentType || "audio/wav";
      } else {
        const err = await coquiResponse.text();
        console.error("[api/tts] Coqui error:", err);
        return sendError(res, "Erreur Coqui: " + err, 502);
      }
    } else {
      return sendError(res, "Aucune API TTS configurée. Définissez ELEVENLABS_API_KEY, TOGETHER_API_KEY, OPENROUTER_API_KEY ou TTS_API_KEY+TTS_API_URL.", 503);
    }

    return sendSuccess(
      res,
      { audio: audioBase64, contentType },
      "Audio généré"
    );
  } catch (err) {
    console.error("[api/tts]", err.message);
    return sendError(res, err.message || "Erreur TTS.", 500);
  }
};

/**
 * Provider Replicate – API asynchrone avec polling.
 * Essaie d'abord les modèles "Try for Free", puis fallback sur les payants.
 * Doc: https://replicate.com/docs/reference/http
 */

const REPLICATE_API_URL = "https://api.replicate.com/v1";

// Modèles gratuits (Try for Free collection)
const FREE_IMAGE_MODELS = [
  "google/imagen-4",
  "black-forest-labs/flux-dev",
  "ideogram-ai/ideogram-v3-turbo",
  "black-forest-labs/flux-1.1-pro",
  "black-forest-labs/flux-kontext-pro",
];

const FREE_VIDEO_MODELS = [
  "minimax/video-01",
  "luma/reframe-video",
];

const FREE_TTS_MODELS = [
  "resemble-ai/chatterbox",
];

// Modèles payants (fallback)
const DEFAULT_IMAGE_MODEL = "black-forest-labs/flux-dev";
const DEFAULT_VIDEO_MODEL = "wavespeedai/wan-2.1-i2v-480p";
const DEFAULT_TTS_MODEL = "resemble-ai/chatterbox";

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_DURATION_MS = 120_000; // 2 minutes max

async function createPrediction(apiKey, model, input) {
  const res = await fetch(`${REPLICATE_API_URL}/models/${model}/predictions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${apiKey}`,
      "Prefer": "wait", // Essayer la réponse synchrone d'abord
    },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate API: ${res.status} ${err}`);
  }

  return await res.json();
}

async function getPrediction(apiKey, id) {
  const res = await fetch(`${REPLICATE_API_URL}/predictions/${id}`, {
    headers: {
      Authorization: `Token ${apiKey}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate API (get): ${res.status} ${err}`);
  }

  return await res.json();
}

async function pollPrediction(apiKey, id) {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_DURATION_MS) {
    const prediction = await getPrediction(apiKey, id);

    if (prediction.status === "succeeded") {
      return prediction;
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(
        `Replicate prediction ${prediction.status}: ${prediction.error || "Unknown error"}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Replicate polling timeout (2 minutes exceeded)");
}

function extractOutput(prediction) {
  if (!prediction.output) return null;
  return Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
}

/**
 * Génère une image via Replicate.
 * Essaie les modèles gratuits en premier, puis le modèle demandé/payant.
 * Retourne: { imageUrl: string, provider: "replicate", model: string }
 */
async function generateImage({ apiKey, model = null, prompt }) {
  if (!apiKey) throw new Error("REPLICATE_API_KEY manquant");

  const modelsToTry = [...FREE_IMAGE_MODELS];
  const targetModel = model || DEFAULT_IMAGE_MODEL;
  if (!modelsToTry.includes(targetModel)) {
    modelsToTry.push(targetModel);
  }

  let lastErr = null;

  for (const m of modelsToTry) {
    try {
      console.log(`[Replicate] Image avec ${m}...`);
      const input = { prompt };
      if (m.includes("flux")) {
        input.num_inference_steps = 28;
        input.guidance_scale = 3.5;
      }

      const prediction = await createPrediction(apiKey, m, input);

      if (prediction.output && prediction.status === "succeeded") {
        const output = extractOutput(prediction);
        if (output) return { imageUrl: output, provider: "replicate", model: m };
      }

      const result = await pollPrediction(apiKey, prediction.id);
      const output = extractOutput(result);
      if (output) return { imageUrl: output, provider: "replicate", model: m };
    } catch (err) {
      lastErr = err;
      console.warn(`[Replicate] Échec ${m}:`, err.message);
    }
  }

  throw lastErr || new Error("Tous les modèles Replicate image ont échoué.");
}

/**
 * Génère une vidéo via Replicate.
 * Essaie les modèles gratuits en premier, puis le modèle demandé/payant.
 * Retourne: { videoUrl: string, provider: "replicate", model: string }
 */
async function generateVideo({ apiKey, model = null, prompt, image_url }) {
  if (!apiKey) throw new Error("REPLICATE_API_KEY manquant");

  const modelsToTry = [...FREE_VIDEO_MODELS];
  const targetModel = model || DEFAULT_VIDEO_MODEL;
  if (!modelsToTry.includes(targetModel)) {
    modelsToTry.push(targetModel);
  }

  let lastErr = null;

  for (const m of modelsToTry) {
    try {
      console.log(`[Replicate] Vidéo avec ${m}...`);
      const input = {
        ...(prompt && { prompt }),
        ...(image_url && { image_url }),
      };

      if (m.includes("wan")) {
        input.num_frames = 81;
        input.fps = 16;
      }

      const prediction = await createPrediction(apiKey, m, input);

      if (prediction.output && prediction.status === "succeeded") {
        const output = extractOutput(prediction);
        if (output) return { videoUrl: output, provider: "replicate", model: m };
      }

      const result = await pollPrediction(apiKey, prediction.id);
      const output = extractOutput(result);
      if (output) return { videoUrl: output, provider: "replicate", model: m };
    } catch (err) {
      lastErr = err;
      console.warn(`[Replicate] Échec ${m}:`, err.message);
    }
  }

  throw lastErr || new Error("Tous les modèles Replicate vidéo ont échoué.");
}

/**
 * Génère du TTS via Replicate.
 * Essaie les modèles gratuits en premier, puis le modèle demandé/payant.
 * Retourne: { audio: string (base64), contentType: string, provider: "replicate", model: string }
 */
async function generateTts({ apiKey, model = null, text, voice = null }) {
  if (!apiKey) throw new Error("REPLICATE_API_KEY manquant");

  const modelsToTry = [...FREE_TTS_MODELS];
  const targetModel = model || DEFAULT_TTS_MODEL;
  if (!modelsToTry.includes(targetModel)) {
    modelsToTry.push(targetModel);
  }

  let lastErr = null;

  for (const m of modelsToTry) {
    try {
      console.log(`[Replicate] TTS avec ${m}...`);
      const input = { text };
      if (voice) input.voice = voice;

      const prediction = await createPrediction(apiKey, m, input);

      if (prediction.output && prediction.status === "succeeded") {
        const output = extractOutput(prediction);
        if (output) {
          // Replicate retourne une URL, on la fetch en buffer
          const audioRes = await fetch(output);
          if (!audioRes.ok) throw new Error("Failed to fetch audio from Replicate output");
          const buffer = await audioRes.buffer();
          return {
            audio: buffer.toString("base64"),
            contentType: "audio/wav",
            provider: "replicate",
            model: m,
          };
        }
      }

      const result = await pollPrediction(apiKey, prediction.id);
      const output = extractOutput(result);
      if (output) {
        const audioRes = await fetch(output);
        if (!audioRes.ok) throw new Error("Failed to fetch audio from Replicate output");
        const buffer = await audioRes.buffer();
        return {
          audio: buffer.toString("base64"),
          contentType: "audio/wav",
          provider: "replicate",
          model: m,
        };
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[Replicate] Échec ${m}:`, err.message);
    }
  }

  throw lastErr || new Error("Tous les modèles Replicate TTS ont échoué.");
}

module.exports = {
  generateImage,
  generateVideo,
  generateTts,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_VIDEO_MODEL,
  DEFAULT_TTS_MODEL,
  FREE_IMAGE_MODELS,
  FREE_VIDEO_MODELS,
  FREE_TTS_MODELS,
};

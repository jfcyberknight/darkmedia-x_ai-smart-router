const openrouter = require("./providers/openrouter");

/** Seul provider utilisé : OpenRouter (simplification). */
const PROVIDERS = [
  {
    id: "openrouter",
    generate: openrouter.generate,
    apiKeyEnv: "OPENROUTER_API_KEY",
    defaultModel: openrouter.DEFAULT_MODEL,
    fallbackModels: [], // Rempli dynamiquement via fetchFreeOpenRouterModels
  },
];

// ─── Modèles gratuits OpenRouter (cache avec TTL) ───

let freeModelsCache = null;
let freeModelsCacheTime = 0;
const FREE_MODELS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 heure

/** Fallback statique si l'API OpenRouter est indisponible. */
const STATIC_FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-3-4b-it:free",
  "google/gemma-3-12b-it:free",
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
];

/**
 * Récupère la liste des modèles gratuits disponibles sur OpenRouter.
 * Met en cache le résultat pendant 1 heure.
 * En cas d'échec, retourne le cache précédent ou la liste statique.
 */
async function fetchFreeOpenRouterModels() {
  const now = Date.now();
  if (freeModelsCache && now - freeModelsCacheTime < FREE_MODELS_CACHE_TTL_MS) {
    return freeModelsCache;
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const freeModels = (data.data || [])
      .filter((m) => {
        const promptPrice = parseFloat(m.pricing?.prompt ?? m.pricing?.input ?? -1);
        const completionPrice = parseFloat(m.pricing?.completion ?? m.pricing?.output ?? -1);
        return promptPrice === 0 && completionPrice === 0;
      })
      .map((m) => m.id)
      .sort((a, b) => a.localeCompare(b));

    freeModelsCache = freeModels.length > 0 ? freeModels : STATIC_FREE_MODELS;
    freeModelsCacheTime = now;
    console.log(`[router] Fetched ${freeModelsCache.length} free OpenRouter models`);
    return freeModelsCache;
  } catch (err) {
    console.error("[router] Failed to fetch free OpenRouter models:", err.message);
    return freeModelsCache || STATIC_FREE_MODELS;
  }
}

/**
 * Détermine si une erreur est retryable (rate-limit, quota, serveur temporaire).
 */
function isRetryableError(err) {
  const status = err.status ?? err.response?.status;
  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    /quota|rate limit|too many requests|temporarily unavailable/i.test(err.message || "")
  );
}

/**
 * Essaie de générer avec une liste de modèles (principal + fallbacks).
 * Retourne le résultat ou lance la dernière erreur.
 */
async function tryGenerateWithFallbacks({ apiKey, messages, models }) {
  let lastErr = null;

  for (const model of models) {
    try {
      const result = await openrouter.generate({ apiKey, model, messages });
      return result;
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err)) throw err;
      console.log(`[router] OpenRouter model "${model}" failed (${err.message}), trying fallback...`);
    }
  }

  throw lastErr;
}

/**
 * Route une requête chat vers OpenRouter.
 * Essaie d'abord les modèles gratuits, puis fallback sur le modèle payant principal.
 * (récupérés dynamiquement depuis l'API OpenRouter).
 */
async function routeChat({ messages, model = null }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY non configuré.");
  }

  const freeModels = await fetchFreeOpenRouterModels();
  const primaryModel = model || openrouter.DEFAULT_MODEL;

  // Construire la liste des modèles à essayer : gratuits > principal payant
  const modelsToTry = [];
  for (const freeModel of freeModels) {
    if (freeModel !== primaryModel && !modelsToTry.includes(freeModel)) {
      modelsToTry.push(freeModel);
    }
  }
  // Ajouter le modèle payant en dernier recours
  if (!modelsToTry.includes(primaryModel)) {
    modelsToTry.push(primaryModel);
  }

  return await tryGenerateWithFallbacks({ apiKey, messages, models: modelsToTry });
}

module.exports = { routeChat, PROVIDERS, fetchFreeOpenRouterModels };

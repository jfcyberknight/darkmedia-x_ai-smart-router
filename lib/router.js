const gemini = require("./providers/gemini");
const groq = require("./providers/groq");
const nvapi = require("./providers/nvapi");
const deepseek = require("./providers/deepseek");
const openrouter = require("./providers/openrouter");
const ollama = require("./providers/ollama");
const mistral = require("./providers/mistral");
const opencodeGo = require("./providers/opencode-go");
const cache = require("./cache");
const metrics = require("./metrics");

/** Liste des providers (OpenRouter est le chemin par défaut). */
const PROVIDERS = [
  {
    id: "gemini",
    generate: gemini.generate,
    apiKeyEnv: "GEMINI_API_KEY",
    defaultModel: gemini.DEFAULT_MODEL,
  },
  {
    id: "groq",
    generate: groq.generate,
    apiKeyEnv: "GROQ_API_KEY",
    defaultModel: groq.DEFAULT_MODEL,
  },
  {
    id: "ollama",
    generate: ollama.generate,
    apiKeyEnv: "OLLAMA_API_KEY", // Optionnel
    defaultModel: ollama.DEFAULT_MODEL,
  },
  {
    id: "nvapi",
    generate: nvapi.generate,
    apiKeyEnv: "NVAPI_API_KEY",
    defaultModel: nvapi.DEFAULT_MODEL,
  },
  {
    id: "deepseek",
    generate: deepseek.generate,
    apiKeyEnv: "DEEPSEEK_API_KEY",
    defaultModel: deepseek.DEFAULT_MODEL,
  },
  {
    id: "openrouter",
    generate: openrouter.generate,
    apiKeyEnv: "OPENROUTER_API_KEY",
    defaultModel: openrouter.DEFAULT_MODEL,
  },
  {
    id: "mistral",
    generate: mistral.generate,
    apiKeyEnv: "MISTRAL_API_KEY",
    defaultModel: mistral.DEFAULT_MODEL,
  },
  {
    id: "opencode-go",
    generate: opencodeGo.generate,
    apiKeyEnv: "OPENCODE_GO_API_KEY",
    defaultModel: opencodeGo.DEFAULT_MODEL,
  },
];

// Délai max par appel provider (AbortController). Au-delà, on aborte et on
// bascule sur le provider suivant. Variable d'env PROVIDER_TIMEOUT_MS (défaut 25s).
const PROVIDER_TIMEOUT_MS = parseInt(process.env.PROVIDER_TIMEOUT_MS, 10) || 25000;

// Provider prioritaire (testé en premier). Par défaut "openrouter". Pour
// réduire la variabilité de latence, cibler un provider direct plus rapide
// (ex. "groq") via ROUTER_PREFERRED_PROVIDER.
const PREFERRED_PROVIDER = (process.env.ROUTER_PREFERRED_PROVIDER || "openrouter")
  .toLowerCase()
  .trim();

/**
 * Route une requête chat vers un provider disponible.
 * Le provider prioritaire (ROUTER_PREFERRED_PROVIDER, défaut openrouter) est
 * testé en premier ; en cas d'erreur (quota 429, 500, 503, timeout, réseau),
 * on tente les autres providers.
 *
 * Un cache LRU+TTL court-circuite les requêtes identiques déjà servies
 * (texte uniquement, pas multimodal) — voir lib/cache.js.
 *
 * @param {object} params
 * @param {Array} params.messages - messages à router
 * @param {object} [params.modelOverrides] - modèles par provider
 * @param {Array<string>} [params.onlyProviders] - restriction à certains providers
 * @param {string} [params.clientScope] - identifiant de client/tenant pour
 *   isoler le cache entre consommateurs (correctif M2). Dérivé par les handlers
 *   du crédential d'authentification présenté.
 */
async function routeChat({ messages, modelOverrides = {}, onlyProviders = null, clientScope }) {
  // --- Cache lookup (texte uniquement) — AVANT la vérification de disponibilité
  // des providers : un hit cache ne nécessite aucun provider configuré. ---
  const cacheKey = cache.computeKey({ messages, modelOverrides, onlyProviders, scope: clientScope });
  if (cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached) {
      metrics.cacheHit();
      return { ...cached, cached: true };
    }
    metrics.cacheMiss();
  }

  let available = PROVIDERS.filter((p) => {
    // Cas particulier Ollama : dispo si clé OU si host défini
    if (p.id === "ollama") {
      return !!(process.env.OLLAMA_API_KEY || process.env.OLLAMA_HOST);
    }
    return !!process.env[p.apiKeyEnv];
  });
  // Restriction optionnelle (ex. requête multimodale -> uniquement les providers
  // OpenAI-compat capables de recevoir un content en tableau image_url).
  if (Array.isArray(onlyProviders) && onlyProviders.length > 0) {
    const allow = new Set(onlyProviders);
    available = available.filter((p) => allow.has(p.id));
    if (available.length === 0) {
      const err = new Error(
        "Aucun provider compatible configuré pour cette requête (multimodale). " +
          "Définissez une clé pour l'un de : " +
          onlyProviders.join(", ") +
          "."
      );
      err.status = 503;
      throw err;
    }
  }
  if (available.length === 0) {
    const err = new Error(
      "Aucun provider configuré. Définissez au moins une clé API " +
        "(GEMINI_API_KEY, GROQ_API_KEY, NVAPI_API_KEY, DEEPSEEK_API_KEY, " +
        "OPENROUTER_API_KEY, MISTRAL_API_KEY) ou OLLAMA_HOST."
    );
    err.status = 503;
    throw err;
  }
  const order = available.sort((a, b) => {
    if (a.id === PREFERRED_PROVIDER) return -1;
    if (b.id === PREFERRED_PROVIDER) return 1;
    return 0;
  });

  const errors = [];

  for (const provider of order) {
    const apiKey = process.env[provider.apiKeyEnv];
    // Ollama peut ne pas avoir de clé
    if (!apiKey && provider.id !== "ollama") {
      errors.push({ provider: provider.id, error: "Clé API non configurée" });
      continue;
    }

    const model = modelOverrides[provider.id] ?? provider.defaultModel;
    metrics.providerAttempt(provider.id);
    try {
      const result = await provider.generate({
        apiKey,
        model,
        messages,
        timeoutMs: PROVIDER_TIMEOUT_MS,
      });
      metrics.providerSuccess(provider.id);
      // On ne cache que les succès texte (cacheKey null si multimodal/désactivé).
      if (cacheKey) cache.set(cacheKey, result);
      return result;
    } catch (err) {
      const status = err.status ?? err.response?.status;
      const isRetryable =
        status === 429 ||
        status === 500 ||
        status === 503 ||
        /quota|rate limit|timeout|network/i.test(err.message || "");
      errors.push({ provider: provider.id, error: err.message, status });
      metrics.providerError(provider.id);
      if (!isRetryable) throw err;
    }
  }
  const summary = errors.map((e) => `${e.provider}: ${e.error}`).join("; ");
  throw new Error(`Tous les providers ont échoué. ${summary}`);
}

module.exports = { routeChat, PROVIDERS, PROVIDER_TIMEOUT_MS, PREFERRED_PROVIDER };

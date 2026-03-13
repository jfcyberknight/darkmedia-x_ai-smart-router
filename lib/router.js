const gemini = require('./providers/gemini');
const groq = require('./providers/groq');

/** Ordre des providers : on essaie Gemini, puis Groq, puis d'autres à venir. */
const PROVIDERS = [
  {
    id: 'gemini',
    generate: gemini.generate,
    apiKeyEnv: 'GEMINI_API_KEY',
    defaultModel: gemini.DEFAULT_MODEL,
  },
  {
    id: 'groq',
    generate: groq.generate,
    apiKeyEnv: 'GROQ_API_KEY',
    defaultModel: groq.DEFAULT_MODEL,
  },
  // Ajouter ici d'autres providers (OpenAI, Anthropic, etc.)
];

/**
 * Route une requête chat vers le premier provider disponible.
 * En cas d'erreur (quota 429, 500, etc.), tente le suivant.
 */
async function routeChat({ messages, modelOverrides = {} }) {
  const errors = [];
  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey) {
      errors.push({ provider: provider.id, error: 'Clé API non configurée' });
      continue;
    }
    const model = modelOverrides[provider.id] ?? provider.defaultModel;
    try {
      const result = await provider.generate({
        apiKey,
        model,
        messages,
      });
      return result;
    } catch (err) {
      const status = err.status ?? err.response?.status;
      const isRetryable = status === 429 || status === 500 || status === 503 || /quota|rate limit/i.test(err.message || '');
      errors.push({ provider: provider.id, error: err.message, status });
      if (!isRetryable) throw err;
    }
  }
  const summary = errors.map((e) => `${e.provider}: ${e.error}`).join('; ');
  throw new Error(`Tous les providers ont échoué. ${summary}`);
}

module.exports = { routeChat, PROVIDERS };

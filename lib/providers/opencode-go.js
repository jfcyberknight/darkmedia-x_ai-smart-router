/**
 * Provider OpenCode Go (subscription) – API compatible OpenAI.
 *
 * Endpoint dédié aux abonnés Go : https://opencode.ai/zen/go/v1
 * Différent de l'endpoint prépayé OpenCode (https://opencode.ai/zen/v1) :
 * une clé Go sur le path Zen renvoie 402, et inversement.
 *
 * Modèles disponibles (ex.) : glm-5.2, kimi-k3, deepseek-v4-pro, grok-4.5,
 * qwen3.7-max, minimax-m3, hy3, etc. Voir `opencode models` pour la liste
 * complète à jour.
 *
 * Pas de SDK requis : REST avec Bearer token.
 */
const { fetchWithTimeout } = require("../http");
const OPENCODE_GO_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const DEFAULT_MODEL = "glm-5.2";

async function generate({ apiKey, model = DEFAULT_MODEL, messages, timeoutMs }) {
  if (!apiKey) throw new Error("OPENCODE_GO_API_KEY manquant");

  const res = await fetchWithTimeout(OPENCODE_GO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content, // string OU tableau (multimodal) transmis tel quel (API OpenAI-compat)
      })),
      max_tokens: 4096,
    }),
  }, timeoutMs);

  if (!res.ok) {
    const err = await res.text();
    const e = new Error(`OpenCode Go API: ${res.status} ${err}`);
    e.status = res.status;
    e.response = { status: res.status };
    throw e;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, provider: "opencode-go", model: data.model || model };
}

module.exports = { generate, DEFAULT_MODEL };

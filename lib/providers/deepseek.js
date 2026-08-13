/**
 * Provider DeepSeek – API compatible OpenAI.
 * Doc: https://api-docs.deepseek.com/api/create-chat-completion/
 * Pas de SDK requis : REST avec Bearer token.
 */
const { fetchWithTimeout } = require("../http");
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

async function generate({ apiKey, model = DEFAULT_MODEL, messages, timeoutMs }) {
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY manquant");

  const res = await fetchWithTimeout(DEEPSEEK_URL, {
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
    const e = new Error(`DeepSeek API: ${res.status} ${err}`);
    e.status = res.status;
    e.response = { status: res.status };
    throw e;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, provider: "deepseek", model: data.model || model };
}

module.exports = { generate, DEFAULT_MODEL };

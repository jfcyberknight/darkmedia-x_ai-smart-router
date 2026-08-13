const { fetchWithTimeout } = require("../http");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Provider Groq – API compatible OpenAI (REST).
 */
async function generate({ apiKey, model = DEFAULT_MODEL, messages, timeoutMs }) {
  if (!apiKey) throw new Error("GROQ_API_KEY manquant");

  const res = await fetchWithTimeout(GROQ_API_URL, {
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
    const e = new Error(`Groq API: ${res.status} ${err}`);
    e.status = res.status;
    throw e;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, provider: "groq", model: data.model || model };
}

module.exports = { generate, DEFAULT_MODEL };

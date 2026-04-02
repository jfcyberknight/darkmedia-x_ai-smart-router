const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Provider Groq – API compatible OpenAI (REST).
 */
async function generate({ apiKey, model = DEFAULT_MODEL, messages }) {
  if (!apiKey) throw new Error("GROQ_API_KEY manquant");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : (m.content?.[0]?.text ?? ""),
      })),
      max_tokens: 4096,
    }),
  });

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

/**
 * Provider OpenRouter – API compatible OpenAI, accès à plusieurs modèles.
 * Doc: https://openrouter.ai/docs/api-reference/chat-completion
 * Pas de SDK requis : REST avec Bearer token.
 */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

const DEFAULT_APP_TITLE = process.env.OPENROUTER_X_TITLE || "AI Smart Router";
const DEFAULT_REFERER = process.env.OPENROUTER_HTTP_REFERER || "https://darkmedia-x.com";

async function generate({ apiKey, model = DEFAULT_MODEL, messages, headers = {} }) {
  if (!apiKey) throw new Error("OPENROUTER_API_KEY manquant");

  const title = headers["x-title"] || headers["X-Title"] || DEFAULT_APP_TITLE;
  const referer =
    headers["http-referer"] ||
    headers["HTTP-Referer"] ||
    headers.referer ||
    headers.Referer ||
    DEFAULT_REFERER;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Title": title,
      "HTTP-Referer": referer,
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
    const e = new Error(`OpenRouter API: ${res.status} ${err}`);
    e.status = res.status;
    e.response = { status: res.status };
    throw e;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, provider: "openrouter", model: data.model || model };
}

module.exports = { generate, DEFAULT_MODEL };

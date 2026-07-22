const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_MODEL = "mistral-small-latest";

/**
 * Provider Mistral AI – API compatible OpenAI (REST).
 * Modèles disponibles : mistral-small-latest, mistral-large-latest, mistral-medium-latest,
 *                       codestral-latest, pixtral-12b-latest (vision)
 */
async function generate({ apiKey, model = DEFAULT_MODEL, messages }) {
  if (!apiKey) throw new Error("MISTRAL_API_KEY manquant");

  const res = await fetch(MISTRAL_API_URL, {
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
    const e = new Error(`Mistral API: ${res.status} ${err}`);
    e.status = res.status;
    throw e;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, provider: "mistral", model: data.model || model };
}

module.exports = { generate, DEFAULT_MODEL };

const DEFAULT_MODEL = "valleejeanfrancois/llama3.2";

/**
 * Provider Ollama – Supporte Local et Cloud (ollama.com/api)
 */
async function generate({ apiKey, model = DEFAULT_MODEL, messages }) {
  // Par défaut, si une clé est présente, on suppose que c'est le cloud ollama.com sauf si OLLAMA_HOST est forcé
  const defaultCloudHost = "https://ollama.com/api";
  const defaultLocalHost = "http://localhost:11434";
  
  const host = process.env.OLLAMA_HOST || (apiKey ? defaultCloudHost : defaultLocalHost);
  const url = `${host.replace(/\/+$/, "")}/api/chat`;

  const headers = {
    "Content-Type": "application/json",
  };
  
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const body = {
    model,
    messages: messages.map((m) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : (m.content?.[0]?.text ?? ""),
    })),
    stream: false,
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    const e = new Error(`Ollama API (${host}): ${res.status} ${err}`);
    e.status = res.status;
    throw e;
  }

  const data = await res.json();
  const text = data.message?.content ?? "";
  
  return { 
    text, 
    provider: "ollama", 
    model: data.model || model 
  };
}

module.exports = { generate, DEFAULT_MODEL };

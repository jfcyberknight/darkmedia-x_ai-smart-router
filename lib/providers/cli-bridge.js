/**
 * Provider CLI Bridge — route les requêtes vers les CLIs IA (hermes, codex, etc.)
 * via le service cli-bridge exposé sur le réseau Docker.
 */
const { fetchWithTimeout } = require("../http");

const BRIDGE_URL = process.env.CLI_BRIDGE_URL || "http://cli-bridge:8793";
const DEFAULT_MODEL = "cli/hermes";

async function generate({ apiKey, model = DEFAULT_MODEL, messages, timeoutMs }) {
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const res = await fetchWithTimeout(`${BRIDGE_URL}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, max_tokens: 4096 }),
  }, timeoutMs);

  if (!res.ok) {
    const err = await res.text();
    const e = new Error(`CLI Bridge API: ${res.status} ${err}`);
    e.status = res.status;
    e.response = { status: res.status };
    throw e;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text, provider: "cli-bridge", model: data.model || model };
}

module.exports = { generate, DEFAULT_MODEL };

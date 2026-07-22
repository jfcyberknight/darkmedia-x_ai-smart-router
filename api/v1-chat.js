const crypto = require("crypto");
const { routeChat } = require("../lib/router");
const { checkApiSecret, checkClientAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");

/**
 * POST /v1/chat/completions — façade OpenAI-compatible.
 *
 * Permet aux apps existantes de brancher le smart-router en changeant
 * UNIQUEMENT leur base URL (`.../v1`) + leur clé : elles envoient un corps
 * OpenAI standard ({model?, messages}) et reçoivent une réponse OpenAI
 * standard ({choices:[{message:{content}}]}). En interne, le router choisit
 * un provider (ordre aléatoire + fallback) — la centralisation recherchée.
 *
 * - Texte : le `model` reçu est IGNORÉ (le router impose ses défauts + fallback,
 *   c'est tout l'intérêt : un provider change -> on corrige ici, pas dans l'app).
 * - Multimodal (content en tableau, ex. image_url) : restreint aux providers
 *   OpenAI-compat capables de vision, et le `model` reçu EST respecté (un modèle
 *   vision est spécifique). Providers visés : openrouter, groq, nvapi, deepseek,
 *   mistral.
 *
 * Auth : identique à /api/chat (Bearer / X-API-Key, ou HMAC X-Client-Key).
 */

const VISION_CAPABLE = ["openrouter", "groq", "nvapi", "deepseek", "mistral"];

function sendOpenAiError(res, status, message, type = "invalid_request_error") {
  res.status(status).json({ error: { message, type, code: null } });
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key, X-Client-Key, X-Signature, X-Timestamp"
  );
  applySecurityHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();

  // Auth (mêmes règles que /api/chat) — checkApiSecret/checkClientAuth
  // répondent au format envelope, mais le code HTTP (401) reste correct pour
  // les clients OpenAI qui ne regardent que le statut.
  const hasClientKey = req.headers["x-client-key"];
  if (hasClientKey) {
    if (!checkClientAuth(req, res)) return;
  } else {
    if (!checkApiSecret(req, res)) return;
  }

  if (req.method !== "POST") {
    return sendOpenAiError(res, 405, "Méthode non autorisée. Utilisez POST.");
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return sendOpenAiError(res, 400, "Body JSON invalide.");
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return sendOpenAiError(res, 400, 'Le champ "messages" (tableau non vide) est requis.');
  }
  for (const m of messages) {
    if (!m || typeof m !== "object" || typeof m.role !== "string") {
      return sendOpenAiError(res, 400, "Chaque message doit avoir un role (string) et un content.");
    }
  }

  // Détection multimodale : au moins un content en tableau (blocs image_url/text).
  const isMultimodal = messages.some((m) => Array.isArray(m.content));

  let onlyProviders = null;
  let modelOverrides = {};
  if (isMultimodal) {
    onlyProviders = VISION_CAPABLE;
    // Le modèle vision est spécifique : on respecte celui envoyé par l'app.
    if (typeof body.model === "string" && body.model) {
      for (const id of VISION_CAPABLE) modelOverrides[id] = body.model;
    }
  }

  try {
    const result = await routeChat({ messages, modelOverrides, onlyProviders });
    const now = Math.floor(Date.now() / 1000);
    return res.status(200).json({
      id: "chatcmpl-" + crypto.randomBytes(12).toString("hex"),
      object: "chat.completion",
      created: now,
      model: result.model,
      // Champ non-standard mais utile pour le debug : quel provider a répondu.
      provider: result.provider,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: result.text },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    });
  } catch (err) {
    console.error("[api/v1-chat]", err.message);
    const status = err.status || (err.message?.includes("échoué") ? 502 : 500);
    return sendOpenAiError(
      res,
      status,
      err.message || "Erreur lors du routage vers les APIs IA.",
      "api_error"
    );
  }
};

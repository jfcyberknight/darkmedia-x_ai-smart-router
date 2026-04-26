const { routeChat } = require("../lib/router");
// Refresh for env variables
const { checkAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");
const {
  validateBodySize,
  validateMessages,
  validateModelOverrides,
} = require("../lib/validate-chat");

/**
 * POST /api/chat
 * Support authentification par :
 *   1. Ancien système : Authorization: Bearer <API_SECRET> ou X-API-Key: <API_SECRET>
 *   2. Nouveau système : X-Client-Key + X-Signature + X-Timestamp
 * Body: { messages: [...], models?: {...} }
 * Réponse au format envelope commun (id, statut, donnees: { content, provider, model }, message).
 */
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Client-Key, X-Signature, X-Timestamp");
  applySecurityHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!checkAuth(req, res)) return;

  if (req.method !== "POST") {
    return sendError(res, "Méthode non autorisée. Utilisez POST.", 405, "METHOD_NOT_ALLOWED");
  }

  const rawBody =
    typeof req.body === "string" ? req.body : (req.body && JSON.stringify(req.body)) || "";
  const sizeCheck = validateBodySize(rawBody);
  if (!sizeCheck.ok) {
    return sendError(res, sizeCheck.error, 413, "PAYLOAD_TOO_LARGE");
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return sendError(res, "Body JSON invalide.", 400, "INVALID_JSON");
  }

  const { messages, model } = body;
  const msgValidation = validateMessages(messages);
  if (!msgValidation.ok) {
    return sendError(res, msgValidation.error, 400, "VALIDATION_ERROR");
  }

  try {
    const result = await routeChat({
      messages: msgValidation.messages,
      model,
    });
    return sendSuccess(
      res,
      {
        content: result.text,
        provider: result.provider,
        model: result.model,
      },
      "Réponse générée"
    );
  } catch (err) {
    console.error("[api/chat]", err.message);
    const status = err.status || (err.message?.includes("échoué") ? 502 : 500);
    return sendError(res, err.message || "Erreur lors du routage vers les APIs IA.", status, "ROUTING_ERROR");
  }
};

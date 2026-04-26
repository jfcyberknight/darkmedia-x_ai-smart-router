const crypto = require("crypto");

/**
 * Génère un identifiant de requête pour corrélation et logs.
 * @returns {string} "req-" + 8 caractères hex
 */
function genRequestId() {
  return "req-" + crypto.randomBytes(4).toString("hex");
}

/**
 * Construit une réponse succès standardisée (best-practices API).
 * @param {object} res - Objet réponse HTTP
 * @param {object|array|null} data - Payload métier
 * @param {string} [message=""] - Résumé court
 * @param {number} [statusCode=200]
 * @param {object} [extraMeta={}] - Métadonnées additionnelles (pagination, etc.)
 */
function sendSuccess(res, data, message = "", statusCode = 200, extraMeta = {}) {
  const requestId = genRequestId();
  const meta = {
    requestId,
    timestamp: new Date().toISOString(),
    ...(message && { message }),
    ...extraMeta,
  };

  res.status(statusCode).json({
    success: true,
    data: data ?? undefined,
    meta,
  });
}

/**
 * Construit une réponse erreur standardisée (best-practices API).
 * Pas de fuite de détail technique sensible dans message (usage production).
 * @param {object} res - Objet réponse HTTP
 * @param {string} message - Message lisible pour le client
 * @param {number} statusCode - 400, 401, 404, 405, 413, 422, 429, 500, 502, etc.
 * @param {string} [errorCode="ERROR"] - Code machine-readable (ex: "AUTH_REQUIRED", "RATE_LIMITED")
 * @param {object} [details=null] - Détails structurés de l'erreur (champs invalides, etc.)
 */
function sendError(res, message, statusCode, errorCode = "ERROR", details = null) {
  const requestId = genRequestId();

  const errorPayload = {
    code: errorCode,
    message,
    ...(details && { details }),
  };

  res.status(statusCode).json({
    success: false,
    error: errorPayload,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = {
  genRequestId,
  sendSuccess,
  sendError,
};
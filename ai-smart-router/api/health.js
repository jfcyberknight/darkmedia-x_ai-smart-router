// Force redeploy to apply Vercel env variables
const { applySecurityHeaders, applyCors } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");

/**
 * GET /api/health (et GET / via rewrite)
 * Public : pas d’authentification, pour sondes de disponibilité et monitoring.
 */
module.exports = async (req, res) => {
  applyCors(res, req, { allowMethods: "GET, OPTIONS", allowHeaders: "Authorization, X-API-Key" });
  applySecurityHeaders(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    return sendError(res, "Méthode non autorisée", 405, "METHOD_NOT_ALLOWED");
  }
  sendSuccess(
    res,
    { ok: true, service: "ai-smart-router" },
    "Service opérationnel"
  );
};

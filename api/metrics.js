const { checkApiSecret } = require("../lib/auth");
const { applySecurityHeaders, applyCors } = require("../lib/security-headers");
const { sendError } = require("../lib/api-response");
const metrics = require("../lib/metrics");

/**
 * GET /metrics — export au format texte Prometheus.
 *
 * Protégé par la clé partagée (AI_SMART_ROUTER_HEADER_KEY) via Authorization
 * Bearer ou X-API-Key, comme /api/chat. Le scrapeur Prometheus doit envoyer
 * cette clé dans son Authorization header.
 */
module.exports = async (req, res) => {
  applyCors(res, req, {
    allowMethods: "GET, OPTIONS",
    allowHeaders: "Authorization, X-API-Key",
  });
  applySecurityHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    return sendError(res, "Méthode non autorisée.", 405);
  }

  // /metrics est protégé : un scraper anonyme ne doit pas exposer les compteurs.
  if (!checkApiSecret(req, res)) return;

  res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  res.status(200).send(metrics.render());
};

/**
 * En-têtes de sécurité pour les réponses API (bonnes pratiques OWASP).
 * Réduit les risques XSS, clickjacking, MIME sniffing.
 */
function applySecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
}

/**
 * CORS restrictif (correctif M1).
 *
 * API privée à usage serveur-à-serveur : par défaut AUCUNE origine navigateur
 * n'est autorisée à lire les réponses (pas d'en-tête Access-Control-Allow-Origin).
 * Si un consommateur navigateur légitime existe, le lister dans la variable
 * d'environnement CORS_ORIGINS (origines exactes séparées par des virgules) ;
 * l'API ne répond alors qu'à ces origines précises (avec Vary: Origin).
 *
 * Les requêtes serveur-à-serveur (sans en-tête Origin) ne sont pas affectées.
 */
function applyCors(
  res,
  req,
  {
    allowMethods = "GET, POST, OPTIONS",
    allowHeaders = "Content-Type, Authorization, X-API-Key, X-Client-Key, X-Signature, X-Timestamp",
  } = {}
) {
  const allowed = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", allowMethods);
  res.setHeader("Access-Control-Allow-Headers", allowHeaders);
}

module.exports = { applySecurityHeaders, applyCors };

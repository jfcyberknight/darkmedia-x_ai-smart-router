const { sendError } = require("./api-response");
const metrics = require("./metrics");

/**
 * Middleware de limitation de concurrence entrante (en-flight requests).
 *
 * Express n'a pas de file bornée : sans garde, un pic de requêtes occupe
 * indéfiniment des connexions (et donc des sockets vers les providers IA).
 * Au-delà de `MAX_CONCURRENT_REQUESTS`, on renvoie 503 + Retry-After pour
 * protéger le conteneur et signaler au client de backoff.
 *
 * Variable d'env :
 *   - MAX_CONCURRENT_REQUESTS (défaut 64) : seuil de requêtes simultanées.
 *
 * La jauge `ai_router_concurrent_requests` est tenue à jour via metrics.
 *
 * Correctif sécurité (M3) : les événements `finish` ET `close` se déclenchent
 * tous les deux sur une réponse normale ; sans garde, `done()` était appelé
 * deux fois et `inFlight` était sous-estimé (~2× le seuil réel admis, jauge
 * Prometheus fausse). Le flag `settled` rend la décrémentation idempotente.
 */
const MAX = parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10) || 64;
let inFlight = 0;

/**
 * Middleware Express : compte les requêtes en vol, rejette au-delà du seuil.
 * À appliquer sur les routes protégées (pas /api/health, pour ne pas bloquer
 * les sondes Docker).
 */
function concurrencyLimiter(req, res, next) {
  if (inFlight >= MAX) {
    res.setHeader("Retry-After", "1");
    return sendError(
      res,
      "Service temporairement surchargé. Réessayez dans un instant.",
      503
    );
  }
  inFlight++;
  metrics.concurrentEnter();
  let settled = false;
  const done = () => {
    if (settled) return;
    settled = true;
    if (inFlight > 0) inFlight--;
    metrics.concurrentLeave();
  };
  res.on("finish", done);
  res.on("close", done);
  next();
}

function currentInFlight() {
  return inFlight;
}

function maxConcurrent() {
  return MAX;
}

module.exports = { concurrencyLimiter, currentInFlight, maxConcurrent };

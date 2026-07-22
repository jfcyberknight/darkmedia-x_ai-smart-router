/**
 * Serveur HTTP autonome pour l'auto-hébergement (VPS OVH, Docker).
 *
 * Remplace le runtime Vercel : monte les handlers `api/*` (signature
 * Vercel `(req, res)`) sur un serveur Express classique, afin que l'API
 * tourne à l'identique en dehors de Vercel.
 *
 * Confidentialité : ce serveur écoute sur 0.0.0.0 DANS le conteneur ;
 * l'exposition réseau (loopback / réseau Docker interne) est gérée par
 * docker-compose.yml — aucun port n'est publié sur l'interface publique.
 *
 * Variables d'environnement :
 *   - PORT (défaut 8080) : port d'écoute interne.
 *   - HOST (défaut 0.0.0.0) : interface d'écoute interne au conteneur.
 */
const express = require("express");

const chatHandler = require("./api/chat");
const normalizeHandler = require("./api/normalize");
const healthHandler = require("./api/health");
const ttsHandler = require("./api/tts");
const v1ChatHandler = require("./api/v1-chat");
const { sendError } = require("./lib/api-response");

const PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

// Limite de body brut alignée sur validate-chat.js (256 Ko) + marge.
const MAX_BODY = "512kb";

const app = express();
app.disable("x-powered-by");

// Corps de requête livré en CHAÎNE BRUTE (comme Vercel sans bodyParser) :
// les handlers chat/normalize/tts font eux-mêmes le JSON.parse et
// contrôlent la taille via validateBodySize. On accepte tout content-type.
app.use(
  express.text({ type: () => true, limit: MAX_BODY, defaultCharset: "utf-8" })
);

// Adapte un handler Vercel `(req, res)` en middleware Express, avec capture
// des erreurs asynchrones non prévues -> réponse envelope 500.
function vercel(handler) {
  return (req, res) => {
    Promise.resolve(handler(req, res)).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[server] Erreur handler:", err && err.message);
      if (!res.headersSent) {
        sendError(res, "Erreur interne du serveur.", 500);
      }
    });
  };
}

// --- Routes ---
// Santé : publique (sondes, monitoring, healthcheck Docker).
app.get("/", vercel(healthHandler));
app.get("/api/health", vercel(healthHandler));
app.options("/api/health", vercel(healthHandler));

// Endpoints protégés (clé partagée / HMAC).
app.post("/api/chat", vercel(chatHandler));
app.options("/api/chat", vercel(chatHandler));

// Façade OpenAI-compatible : brancher une app existante = juste changer sa
// base URL vers .../v1 (elle continue d'envoyer/parser du OpenAI standard).
app.post("/v1/chat/completions", vercel(v1ChatHandler));
app.options("/v1/chat/completions", vercel(v1ChatHandler));

app.post("/api/normalize", vercel(normalizeHandler));
app.options("/api/normalize", vercel(normalizeHandler));

app.post("/api/tts", vercel(ttsHandler));
app.options("/api/tts", vercel(ttsHandler));

// 404 au format envelope commun.
app.use((req, res) => {
  sendError(res, `Route inconnue : ${req.method} ${req.path}`, 404);
});

// Filet de sécurité Express (erreurs synchrones des middlewares, ex. 413
// body trop volumineux d'express.text).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err && err.status === 413 ? 413 : 500;
  const msg =
    status === 413 ? "Body trop volumineux." : "Erreur interne du serveur.";
  if (!res.headersSent) sendError(res, msg, status);
});

// Démarre l'écoute uniquement en exécution directe (node server.js), pas à
// l'import (utile pour les tests qui montent l'app sans ouvrir de port).
if (require.main === module) {
  const server = app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`[ai-smart-router] écoute sur http://${HOST}:${PORT}`);
  });

  // Arrêt propre (SIGTERM envoyé par Docker à l'arrêt du conteneur).
  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`[ai-smart-router] ${signal} reçu, arrêt en cours…`);
    server.close(() => process.exit(0));
    // Filet : forcer la sortie si les connexions traînent.
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

module.exports = app;

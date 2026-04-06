const crypto = require("crypto");
const { sendError } = require("./api-response");

/**
 * Comparaison constant-time pour éviter les attaques par timing.
 */
function secureCompare(a, b) {
  const ha = crypto.createHash("sha256").update(String(a), "utf8").digest();
  const hb = crypto.createHash("sha256").update(String(b), "utf8").digest();
  if (ha.length !== hb.length) return false;
  return crypto.timingSafeEqual(ha, hb);
}

/**
 * Génère une signature HMAC-SHA256
 * @param {string} payload - données à signer
 * @param {string} secret - clé secrète
 * @returns {string} signature en hexadécimal
 */
function generateSignature(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Vérifie une signature HMAC-SHA256
 * @param {string} payload - données originales
 * @param {string} signature - signature à vérifier
 * @param {string} secret - clé secrète
 * @returns {boolean} true si la signature est valide
 */
function verifySignature(payload, signature, secret) {
  const expectedSignature = generateSignature(payload, secret);
  return secureCompare(signature, expectedSignature);
}

/**
 * Nouvelle authentification : clé client + signature HMAC avec clé serveur secret
 * Headers attendus :
 *   - X-Client-Key: <client_key> (clé publique)
 *   - X-Signature: <hmac_signature> (signature de la requête)
 *   - X-Timestamp: <timestamp> (optionnel, pour replay protection)
 *
 * Variables d'env :
 *   - CLIENT_KEY: clé cliente
 *   - SERVER_SECRET: clé secrète serveur
 */
function checkClientAuth(req, res) {
  const clientKey = process.env.CLIENT_KEY_AI_SMART_ROUTER;
  const serverSecret = process.env.SERVER_SECRET_AI_SMART_ROUTER;

  // Vérifier que les clés sont configurées
  if (!clientKey || !serverSecret) {
    sendError(
      res,
      "Authentification non configurée. Définissez CLIENT_KEY et SERVER_SECRET.",
      500
    );
    return false;
  }

  const providedClientKey = (req.headers["x-client-key"] || "").trim();
  const providedSignature = (req.headers["x-signature"] || "").trim();
  const providedTimestamp = (req.headers["x-timestamp"] || "").trim();

  // Vérifier la clé cliente
  if (!providedClientKey || !secureCompare(providedClientKey, clientKey)) {
    sendError(res, "Clé client invalide ou manquante.", 401);
    return false;
  }

  // Vérifier la signature (basée sur le body ou une chaîne vide)
  const body = req.body ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body)) : "";
  const payload = providedTimestamp ? `${body}:${providedTimestamp}` : body;

  if (!providedSignature || !verifySignature(payload, providedSignature, serverSecret)) {
    sendError(res, "Signature invalide ou manquante.", 401);
    return false;
  }

  // Optionnel : vérifier le timestamp pour éviter les attaques par rejeu (5 min tolerance)
  if (providedTimestamp) {
    const requestTime = parseInt(providedTimestamp, 10);
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - requestTime);
    if (timeDiff > 5 * 60 * 1000) {
      sendError(res, "Requête expirée (timestamp invalide).", 401);
      return false;
    }
  }

  return true;
}

/**
 * Vérifie le secret API (ancien système, pour compatibilité)
 * En-têtes acceptés : Authorization: Bearer <API_SECRET> ou X-API-Key: <API_SECRET>
 */
function checkApiSecret(req, res) {
  const secret = process.env.API_SECRET;
  if (!secret || secret.length < 8) {
    sendError(
      res,
      "Accès refusé. Définissez API_SECRET dans les variables d'environnement (8 caractères min).",
      401
    );
    return false;
  }
  const authHeader = req.headers.authorization || "";
  const apiKeyHeader = req.headers["x-api-key"] || "";
  // X-API-Key takes priority over Authorization: Bearer
  const token = apiKeyHeader.trim() || (authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "");
  if (!token || !secureCompare(token, secret)) {
    sendError(res, "Clé API invalide ou manquante.", 401);
    return false;
  }
  return true;
}

module.exports = { checkApiSecret, checkClientAuth, generateSignature, verifySignature };

const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const AUTH_PROVIDER_URL = 'https://auth-provider-api.vercel.app';
const OWNER_EMAIL = process.env.OWNER_EMAIL;
// Correctif sécurité (C1) : plus AUCUN fallback codé en dur, et la clé API
// partagée n'est PLUS réutilisée comme secret JWT. Si JWT_SECRET (dédié,
// aléatoire, ≥32 caractères) est absent, la signature échoue et la vérification
// renvoie null (fail-closed) au lieu de permettre la forge de sessions avec un
// secret public connu.
const JWT_SECRET = process.env.JWT_SECRET;
const AUTH_PROVIDER_API_KEY = process.env.AUTH_PROVIDER_API_KEY || process.env.API_SECRET;

/**
 * Valide un idToken Google via l'API externe Auth Provider.
 */
async function verifyWithExternalProvider(idToken) {
  const res = await fetch(`${AUTH_PROVIDER_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': AUTH_PROVIDER_API_KEY,
    },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Échec de la validation via Auth Provider API');
  }

  const user = data.donnees;
  
  if (!OWNER_EMAIL || user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    throw new Error('Accès interdit : email non autorisé.');
  }

  return {
    email: user.email,
    name: user.name,
    picture: user.picture,
    uid: user.uid
  };
}

/**
 * Crée un JWT pour la session locale.
 * Échoue (fail-closed) si JWT_SECRET est absent ou trop court.
 */
function createSessionToken(user) {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET non défini ou trop court (≥32 caractères requis) — refus de signer une session.'
    );
  }
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Vérifie le JWT de la session locale.
 * Renvoie null (session refusée) si JWT_SECRET est absent ou trop court.
 */
function verifySessionToken(token) {
  if (!JWT_SECRET || JWT_SECRET.length < 32) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Récupère le token depuis les cookies.
 */
function getSessionFromRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_session;
  if (!token) return null;
  return verifySessionToken(token);
}

module.exports = {
  verifyWithExternalProvider,
  createSessionToken,
  getSessionFromRequest,
};

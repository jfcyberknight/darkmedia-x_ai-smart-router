const crypto = require("crypto");

/**
 * Cache LRU en mémoire avec TTL, pour les réponses de chat déterministes.
 *
 * Objectif : éliminer les double-appels coûteux au provider IA quand la même
 * requête (messages + modèle) est rejouée à court terme. La latence p99 d'un
 * hit tombe à ~1 ms (lookup Map) au lieu de 350 ms–3 s (OpenRouter).
 *
 * Limites :
 *   - Ne met en cache QUE les requêtes texte (content string). Les requêtes
 *     multimodales (content en tableau, ex. image_url) sont exclues : leur
 *     résultat peut dépendre d'un contenu binaire non reproductible.
 *   - Ne cache QUE les succès (le router ne stocke jamais d'erreur).
 *   - Taille bornée (LRU) + TTL : pas de fuite mémoire sur la durée.
 *
 * Variables d'env :
 *   - CACHE_ENABLED (défaut "true") : "false" désactive complètement.
 *   - CACHE_TTL_SECONDS (défaut 30) : durée de vie d'une entrée.
 *   - CACHE_MAX_ENTRIES (défaut 256) : nombre max d'entrées (éviction LRU).
 */
const TTL_MS = (parseInt(process.env.CACHE_TTL_SECONDS, 10) || 30) * 1000;
const MAX_ENTRIES = parseInt(process.env.CACHE_MAX_ENTRIES, 10) || 256;
const ENABLED = (process.env.CACHE_ENABLED || "true").toLowerCase() !== "false";

// Map insère en ordre d'insertion : le plus ancien = première clé de l'itérateur.
// C'est notre candidat LRU pour l'éviction. On delete+set à chaque accès pour
// rafraîchir l'ordre (accès récent = dernière position).
const store = new Map();

function isEnabled() {
  return ENABLED;
}

/**
 * Détermine si une requête est éligible au cache (texte uniquement, pas
 * multimodal). Renvoie false si un message.content est un tableau.
 */
function isCacheable(messages) {
  if (!Array.isArray(messages)) return false;
  return messages.every((m) => typeof m.content === "string");
}

/**
 * Calcule une clé de cache stable (sha256, 16 hex) pour la requête.
 * Renvoie null si le cache est désactivé ou la requête non éligible.
 */
function computeKey({ messages, modelOverrides = {}, onlyProviders = null }) {
  if (!ENABLED || !isCacheable(messages)) return null;
  const payload = JSON.stringify({
    m: messages.map((m) => ({ r: m.role, c: m.content })),
    mo: modelOverrides,
    op: onlyProviders,
  });
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

function get(key) {
  if (!key || !ENABLED) return undefined;
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > TTL_MS) {
    store.delete(key);
    return undefined;
  }
  // Rafraîchit l'ordre LRU (delete + set = déplace en fin).
  store.delete(key);
  store.set(key, entry);
  return entry.value;
}

function set(key, value) {
  if (!key || !ENABLED) return;
  if (store.size >= MAX_ENTRIES) {
    // Éviction LRU : première clé = la moins récemment utilisée.
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, { value, ts: Date.now() });
}

function clear() {
  store.clear();
}

function size() {
  return store.size;
}

module.exports = { computeKey, get, set, clear, size, isEnabled, isCacheable };

/**
 * fetch avec timeout (AbortController) + normalisation des erreurs réseau.
 *
 * Sans ceci, un provider qui traîne (observé : 3,2 s sur OpenRouter, parfois
 * plus) occupe une connexion Express indéfiniment. Chaque appel provider passe
 * ici : au-delà de `timeoutMs`, la requête est abortée et une erreur 503
 * (retryable) est levée — le router bascule alors sur le provider suivant.
 *
 * Les erreurs réseau brutes (ECONNREFUSED, DNS, socket hang up) sont aussi
 * normalisées en 503 : auparavant elles remontaient sans `status`, donc le
 * router ne les considérait pas retryables et échouait immédiatement au lieu
 * de fallback. Désormais tout échec réseau -> 503 -> fallback.
 *
 * @param {string} url
 * @param {object} options - options fetch (method, headers, body...)
 * @param {number} [timeoutMs=25000] - délai max avant abort
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted || err?.name === "AbortError") {
      const e = new Error(`Provider timeout après ${timeoutMs}ms (${url})`);
      e.status = 503;
      e.isTimeout = true;
      throw e;
    }
    // Erreur réseau (DNS, connexion refusée, socket hang up...) -> retryable.
    const e = new Error(`Erreur réseau provider: ${err?.message || err}`);
    e.status = 503;
    e.isNetworkError = true;
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchWithTimeout };

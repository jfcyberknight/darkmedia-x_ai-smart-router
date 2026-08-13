/**
 * Compteurs et jauge Prometheus pour le routeur IA.
 *
 * Exposés sur GET /metrics (texte Prometheus, protégé par la clé partagée).
 * Permet de piloter le fallback, le cache et la charge sans lire les logs.
 *
 * Métriques exposées :
 *   - ai_router_requests_total{status}            (counter)
 *   - ai_router_cache_hits_total                  (counter)
 *   - ai_router_cache_misses_total                (counter)
 *   - ai_router_provider_attempts_total{provider} (counter)
 *   - ai_router_provider_success_total{provider}  (counter)
 *   - ai_router_provider_errors_total{provider}   (counter)
 *   - ai_router_concurrent_requests               (gauge)
 *   - ai_router_request_duration_seconds_bucket{le} (histogram)
 */

const counters = {
  requests: new Map(), // status -> n
  cacheHits: 0,
  cacheMisses: 0,
  providerAttempts: new Map(), // provider -> n
  providerSuccess: new Map(), // provider -> n
  providerErrors: new Map(), // provider -> n
};

let concurrent = 0;

// Histogramme de latence (secondes). Buckets Prometheus standards pour API.
const BUCKETS = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30];
const histogram = new Array(BUCKETS.length).fill(0);
let histCount = 0;
let histSum = 0;

function inc(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function requestStatus(status) {
  inc(counters.requests, String(status));
}

function cacheHit() {
  counters.cacheHits++;
}

function cacheMiss() {
  counters.cacheMisses++;
}

function providerAttempt(provider) {
  inc(counters.providerAttempts, provider);
}

function providerSuccess(provider) {
  inc(counters.providerSuccess, provider);
}

function providerError(provider) {
  inc(counters.providerErrors, provider);
}

function concurrentEnter() {
  concurrent++;
}

function concurrentLeave() {
  if (concurrent > 0) concurrent--;
}

function observeDuration(seconds) {
  histCount++;
  histSum += seconds;
  for (let i = 0; i < BUCKETS.length; i++) {
    if (seconds <= BUCKETS[i]) histogram[i]++;
  }
}

function render() {
  const lines = [];
  const now = Date.now();

  lines.push("# HELP ai_router_requests_total Total requêtes par statut HTTP.");
  lines.push("# TYPE ai_router_requests_total counter");
  for (const [status, n] of counters.requests) {
    lines.push(`ai_router_requests_total{status="${status}"} ${n} ${now}`);
  }

  lines.push("# HELP ai_router_cache_hits_total Hits de cache de chat.");
  lines.push("# TYPE ai_router_cache_hits_total counter");
  lines.push(`ai_router_cache_hits_total ${counters.cacheHits} ${now}`);

  lines.push("# HELP ai_router_cache_misses_total Misses de cache de chat.");
  lines.push("# TYPE ai_router_cache_misses_total counter");
  lines.push(`ai_router_cache_misses_total ${counters.cacheMisses} ${now}`);

  lines.push("# HELP ai_router_provider_attempts_total Tentatives par provider.");
  lines.push("# TYPE ai_router_provider_attempts_total counter");
  for (const [provider, n] of counters.providerAttempts) {
    lines.push(`ai_router_provider_attempts_total{provider="${provider}"} ${n} ${now}`);
  }

  lines.push("# HELP ai_router_provider_success_total Succès par provider.");
  lines.push("# TYPE ai_router_provider_success_total counter");
  for (const [provider, n] of counters.providerSuccess) {
    lines.push(`ai_router_provider_success_total{provider="${provider}"} ${n} ${now}`);
  }

  lines.push("# HELP ai_router_provider_errors_total Erreurs par provider.");
  lines.push("# TYPE ai_router_provider_errors_total counter");
  for (const [provider, n] of counters.providerErrors) {
    lines.push(`ai_router_provider_errors_total{provider="${provider}"} ${n} ${now}`);
  }

  lines.push("# HELP ai_router_concurrent_requests Requêtes en cours (jauge).");
  lines.push("# TYPE ai_router_concurrent_requests gauge");
  lines.push(`ai_router_concurrent_requests ${concurrent} ${now}`);

  lines.push("# HELP ai_router_request_duration_seconds Latence des requêtes chat.");
  lines.push("# TYPE ai_router_request_duration_seconds histogram");
  let cumulative = 0;
  for (let i = 0; i < BUCKETS.length; i++) {
    cumulative = histogram[i];
    lines.push(
      `ai_router_request_duration_seconds_bucket{le="${BUCKETS[i]}"} ${cumulative} ${now}`
    );
  }
  lines.push(`ai_router_request_duration_seconds_bucket{le="+Inf"} ${histCount} ${now}`);
  lines.push(`ai_router_request_duration_seconds_count ${histCount} ${now}`);
  lines.push(`ai_router_request_duration_seconds_sum ${histSum.toFixed(6)} ${now}`);

  return lines.join("\n") + "\n";
}

function reset() {
  counters.requests.clear();
  counters.cacheHits = 0;
  counters.cacheMisses = 0;
  counters.providerAttempts.clear();
  counters.providerSuccess.clear();
  counters.providerErrors.clear();
  concurrent = 0;
  histogram.fill(0);
  histCount = 0;
  histSum = 0;
}

module.exports = {
  requestStatus,
  cacheHit,
  cacheMiss,
  providerAttempt,
  providerSuccess,
  providerError,
  concurrentEnter,
  concurrentLeave,
  observeDuration,
  render,
  reset,
};

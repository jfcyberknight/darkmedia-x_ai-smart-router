#!/usr/bin/env node
/**
 * Benchmark léger pour ai-smart-router — utilise uniquement le module http Node.
 *
 * Mesure latence (p50/p90/p95/p99), throughput et taux d'erreur par scénario,
 * sans dépendance externe (pas de wrk/ab/hey). Suffit pour un audit rapide de
 * la couche routeur (overhead pur, sans appel IA réel).
 *
 * Usage :
 *   node scripts/bench.js                      # défauts (127.0.0.1:8080)
 *   PORT=18781 API_KEY=xxx node scripts/bench.js
 *
 * Scénarios :
 *   1. GET /api/health (public, no-op externe) — overhead pur du routeur.
 *   2. POST /v1/chat/completions sans clé (rejet auth 401) — chemin auth.
 *   3. POST /v1/chat/completions clé valide + body invalide (400 validation).
 *   4. POST /v1/chat/completions clé valide + messages valides (réel provider).
 *      ⚠ Consomme des crédits IA — limité à 3 requêtes séquentielles par défaut.
 */
const http = require("http");

const HOST = process.env.BENCH_HOST || "127.0.0.1";
const PORT = parseInt(process.env.BENCH_PORT || process.env.PORT || "8080", 10);
const API_KEY = process.env.API_KEY || process.env.AI_SMART_ROUTER_HEADER_KEY || "";

function pct(arr, q) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

function fmtMs(v) { return `${v.toFixed(2)} ms`; }

function oneRequest({ method, path, headers, body }) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const data = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (data) {
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(data);
    }
    const req = http.request(
      { host: HOST, port: PORT, method, path, headers: reqHeaders },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const ms = Number(process.hrtime.bigint() - start) / 1e6;
          resolve({ status: res.statusCode, ms, bytes: Buffer.concat(chunks).length });
        });
      }
    );
    req.on("error", () => resolve({ status: 0, ms: Number(process.hrtime.bigint() - start) / 1e6, bytes: 0 }));
    if (data) req.write(data);
    req.end();
  });
}

async function runScenario(name, opts, { concurrency = 8, total = 400, warmup = 20 } = {}) {
  for (let i = 0; i < warmup; i++) await oneRequest(opts);

  const latencies = [];
  let ok = 0, err = 0, bytes = 0;
  const t0 = process.hrtime.bigint();
  let dispatched = 0, completed = 0;

  await new Promise((resolve) => {
    const next = () => {
      if (dispatched >= total) return;
      dispatched++;
      oneRequest(opts).then((r) => {
        latencies.push(r.ms);
        if (r.status >= 200 && r.status < 300) ok++; else err++;
        bytes += r.bytes;
        completed++;
        if (completed >= total) resolve();
        else if (dispatched < total) next();
      });
    };
    for (let i = 0; i < concurrency; i++) next();
  });

  const durS = Number(process.hrtime.bigint() - t0) / 1e9;
  const rps = total / durS;
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const results = {
    scenario: name,
    requests: total,
    duration_s: +durS.toFixed(3),
    rps: +rps.toFixed(1),
    success: ok,
    errors: err,
    avg: fmtMs(avg),
    p50: fmtMs(pct(latencies, 0.5)),
    p90: fmtMs(pct(latencies, 0.9)),
    p95: fmtMs(pct(latencies, 0.95)),
    p99: fmtMs(pct(latencies, 0.99)),
    max: fmtMs(Math.max(...latencies)),
    bytes_recv: bytes,
  };
  console.log(JSON.stringify(results, null, 2));
  return results;
}

async function realChatSample() {
  const samples = [];
  for (let i = 0; i < 3; i++) {
    const r = await oneRequest({
      method: "POST",
      path: "/v1/chat/completions",
      headers: { "X-API-Key": API_KEY },
      body: {
        model: "openrouter/fusion",
        messages: [{ role: "user", content: 'Réponds uniquement par le mot "ok".' }],
      },
    });
    samples.push(r);
    console.error(`  [real-chat #${i + 1}] HTTP ${r.status} — ${fmtMs(r.ms)} — ${r.bytes}B`);
  }
  const okSamples = samples.filter((s) => s.status === 200).map((s) => s.ms);
  if (okSamples.length) {
    const avg = okSamples.reduce((a, b) => a + b, 0) / okSamples.length;
    console.log(JSON.stringify({
      scenario: "real-chat (provider e2e, 3 séquentielles)",
      samples: samples.map((s) => ({ status: s.status, ms: +s.ms.toFixed(2) })),
      avg_success: fmtMs(avg),
      note: "Latence dominée par le provider (réseau + inférence), pas par le router.",
    }, null, 2));
  } else {
    console.log(JSON.stringify({
      scenario: "real-chat (provider e2e)",
      samples: samples.map((s) => ({ status: s.status, ms: +s.ms.toFixed(2) })),
      note: "Aucune réponse 200 — voir stderr ci-dessus.",
    }, null, 2));
  }
}

(async () => {
  console.log(`=== ai-smart-router — benchmark (${HOST}:${PORT}) ===\n`);

  console.log("--- Scénario 1 : GET /api/health (public, no-op externe) ---");
  await runScenario("health", { method: "GET", path: "/api/health" }, { concurrency: 16, total: 1000 });

  console.log("\n--- Scénario 2 : POST /v1/chat/completions sans clé (rejet auth 401) ---");
  await runScenario("auth-reject-401", { method: "POST", path: "/v1/chat/completions", body: { messages: [] } }, { concurrency: 16, total: 1000 });

  console.log("\n--- Scénario 3 : POST /v1/chat/completions clé valide + body invalide (400 validation) ---");
  await runScenario("validation-400", {
    method: "POST", path: "/v1/chat/completions",
    headers: { "X-API-Key": API_KEY }, body: { messages: [] },
  }, { concurrency: 16, total: 1000 });

  if (API_KEY) {
    console.log("\n--- Scénario 4 : POST /v1/chat/completions clé valide + messages valides (réel provider) ---");
    await realChatSample();
  } else {
    console.log("\n--- Scénario 4 : ignoré (API_KEY non définie) ---");
  }

  console.log("\n=== Fin du benchmark ===");
})().catch((e) => { console.error("Benchmark failed:", e); process.exit(1); });

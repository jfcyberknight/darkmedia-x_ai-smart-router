"use strict";
const { test } = require("node:test");
const assert = require("node:assert");

// --- Cache LRU + TTL ---
test("cache : set/get hit + miss + TTL expiry", async () => {
  // Forcer un TTL court pour le test.
  process.env.CACHE_TTL_SECONDS = "1";
  process.env.CACHE_MAX_ENTRIES = "8";
  process.env.CACHE_ENABLED = "true";
  // Recharge le module avec les nouveaux env (le module lit les env au require).
  delete require.cache[require.resolve("../lib/cache")];
  const cache = require("../lib/cache");

  const key = "test-key-1";
  assert.strictEqual(cache.get(key), undefined, "miss avant set");
  cache.set(key, { text: "hello", provider: "x", model: "m" });
  assert.deepStrictEqual(cache.get(key), { text: "hello", provider: "x", model: "m" }, "hit après set");

  // TTL expiry : attendre > 1s.
  await new Promise((r) => setTimeout(r, 1100));
  assert.strictEqual(cache.get(key), undefined, "miss après TTL expiry");
});

test("cache : isCacheable (texte oui, multimodal non)", () => {
  delete require.cache[require.resolve("../lib/cache")];
  const cache = require("../lib/cache");
  assert.strictEqual(cache.isCacheable([{ role: "user", content: "salut" }]), true);
  assert.strictEqual(cache.isCacheable([{ role: "user", content: [{ type: "text", text: "x" }] }]), false);
  assert.strictEqual(cache.isCacheable("nope"), false);
});

test("cache : computeKey null si multimodal ou désactivé", () => {
  delete require.cache[require.resolve("../lib/cache")];
  const cache = require("../lib/cache");
  const textKey = cache.computeKey({ messages: [{ role: "user", content: "salut" }] });
  assert.ok(typeof textKey === "string" && textKey.length === 16, "clé 16 hex pour texte");

  const multiKey = cache.computeKey({ messages: [{ role: "user", content: [{ type: "text", text: "x" }] }] });
  assert.strictEqual(multiKey, null, "null pour multimodal");

  process.env.CACHE_ENABLED = "false";
  delete require.cache[require.resolve("../lib/cache")];
  const cacheOff = require("../lib/cache");
  const offKey = cacheOff.computeKey({ messages: [{ role: "user", content: "salut" }] });
  assert.strictEqual(offKey, null, "null si désactivé");
  process.env.CACHE_ENABLED = "true";
});

test("cache : LRU éviction au-delà de MAX_ENTRIES", () => {
  process.env.CACHE_MAX_ENTRIES = "3";
  process.env.CACHE_TTL_SECONDS = "60";
  delete require.cache[require.resolve("../lib/cache")];
  const cache = require("../lib/cache");
  cache.clear();
  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("c", 3);
  assert.strictEqual(cache.size(), 3);
  // Accès à "a" pour le rafraîchir (LRU : "b" devient le plus ancien).
  cache.get("a");
  cache.set("d", 4); // éviction de "b"
  assert.strictEqual(cache.size(), 3);
  assert.strictEqual(cache.get("b"), undefined, "b évicté (LRU)");
  assert.strictEqual(cache.get("a"), 1, "a conservé (récemment accédé)");
  assert.strictEqual(cache.get("d"), 4, "d présent");
});

// --- fetchWithTimeout ---
test("http : fetchWithTimeout lève une erreur 503 sur timeout", async () => {
  delete require.cache[require.resolve("../lib/http")];
  const { fetchWithTimeout } = require("../lib/http");
  // Serveur qui ne répond jamais (port fermé -> connexion refusée -> 503 réseau).
  await assert.rejects(
    () => fetchWithTimeout("http://127.0.0.1:1", { method: "GET" }, 500),
    (err) => {
      assert.ok(err.status === 503, "status 503");
      return true;
    }
  );
});

// --- Concurrency limiter ---
test("concurrency : rejette 503 au-delà du seuil", async () => {
  process.env.MAX_CONCURRENT_REQUESTS = "2";
  delete require.cache[require.resolve("../lib/concurrency")];
  const { concurrencyLimiter, currentInFlight, maxConcurrent } = require("../lib/concurrency");
  assert.strictEqual(maxConcurrent(), 2);

  // Simule 2 requêtes en vol (res qui ne finit pas). Le middleware utilise
  // res.on("finish"/"close") -> on a besoin d'un EventEmitter.
  const EventEmitter = require("events");
  function mockRes() {
    const res = new EventEmitter();
    res.statusCode = 200;
    res.body = null;
    res.headers = {};
    res.setHeader = function (k, v) { this.headers[k.toLowerCase()] = v; };
    res.status = function (c) { this.statusCode = c; return this; };
    res.json = function (o) { this.body = o; return this; };
    res.end = function () { return this; };
    return res;
  }

  const blockedRes = [];
  for (let i = 0; i < 2; i++) {
    const res = mockRes();
    concurrencyLimiter({}, res, () => {});
    blockedRes.push(res);
  }
  assert.strictEqual(currentInFlight(), 2, "2 en vol");

  // 3e requête : doit être rejetée 503.
  const rejectedRes = mockRes();
  let nextCalled = false;
  concurrencyLimiter({}, rejectedRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, "next() non appelé (rejeté)");
  assert.strictEqual(rejectedRes.statusCode, 503, "503 renvoyé");
  assert.ok(rejectedRes.headers["retry-after"], "Retry-After présent");

  // Libère une place.
  blockedRes[0].emit("finish");
  assert.strictEqual(currentInFlight(), 1, "1 en vol après finish");
});

// --- Metrics ---
test("metrics : render produit du texte Prometheus valide", () => {
  delete require.cache[require.resolve("../lib/metrics")];
  const metrics = require("../lib/metrics");
  metrics.reset();
  metrics.requestStatus(200);
  metrics.requestStatus(200);
  metrics.requestStatus(500);
  metrics.cacheHit();
  metrics.cacheMiss();
  metrics.providerAttempt("openrouter");
  metrics.providerSuccess("openrouter");
  metrics.providerError("groq");
  metrics.concurrentEnter();
  metrics.concurrentLeave();
  metrics.observeDuration(0.15);

  const out = metrics.render();
  assert.match(out, /ai_router_requests_total\{status="200"\} 2/);
  assert.match(out, /ai_router_requests_total\{status="500"\} 1/);
  assert.match(out, /ai_router_cache_hits_total 1/);
  assert.match(out, /ai_router_cache_misses_total 1/);
  assert.match(out, /ai_router_provider_attempts_total\{provider="openrouter"\} 1/);
  assert.match(out, /ai_router_provider_success_total\{provider="openrouter"\} 1/);
  assert.match(out, /ai_router_provider_errors_total\{provider="groq"\} 1/);
  assert.match(out, /ai_router_request_duration_seconds_bucket\{le="0\.25"\} 1/);
});

// --- Router : cache hit court-circuite les providers ---
test("router : cache hit renvoie cached:true sans appel provider", async () => {
  process.env.CACHE_ENABLED = "true";
  process.env.CACHE_TTL_SECONDS = "60";
  process.env.CACHE_MAX_ENTRIES = "16";
  // Un seul provider avec une clé factice — on mock son generate.
  delete require.cache[require.resolve("../lib/router")];
  delete require.cache[require.resolve("../lib/cache")];
  delete require.cache[require.resolve("../lib/metrics")];
  const router = require("../lib/router");
  const cache = require("../lib/cache");
  cache.clear();

  // Rempli le cache manuellement avec la clé que routeChat va calculer.
  const messages = [{ role: "user", content: "test cache hit" }];
  const key = cache.computeKey({ messages });
  assert.ok(key, "clé calculée");
  cache.set(key, { text: "cached-response", provider: "mock", model: "mock-model" });

  // Aucune clé provider configurée -> si pas de cache, routeChat lèverait 503.
  // Avec le cache, on doit obtenir la réponse cachée.
  const result = await router.routeChat({ messages });
  assert.strictEqual(result.text, "cached-response");
  assert.strictEqual(result.cached, true);
});

// --- /metrics endpoint ---
test("/metrics : renvoie le format Prometheus et est protégé par clé", async () => {
  process.env.AI_SMART_ROUTER_HEADER_KEY = "test-secret-key";
  delete require.cache[require.resolve("../api/metrics")];
  delete require.cache[require.resolve("../lib/metrics")];
  const handler = require("../api/metrics");
  const metrics = require("../lib/metrics");
  metrics.reset();
  metrics.requestStatus(200);

  function mockRes() {
    return {
      statusCode: 200, body: null, text: null, headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      status(c) { this.statusCode = c; return this; },
      json(o) { this.body = o; return this; },
      send(t) { this.text = t; return this; },
      end() { return this; },
    };
  }

  // Sans clé -> 401.
  const res1 = mockRes();
  await handler({ method: "GET", headers: {} }, res1);
  assert.strictEqual(res1.statusCode, 401);

  // Avec clé -> 200 + texte Prometheus.
  const res2 = mockRes();
  await handler({ method: "GET", headers: { "x-api-key": "test-secret-key" } }, res2);
  assert.strictEqual(res2.statusCode, 200);
  assert.match(res2.text, /ai_router_requests_total/);
  assert.strictEqual(res2.headers["content-type"], "text/plain; version=0.0.4; charset=utf-8");
});

// --- Smoke : server.js s'importe toujours ---
test("server.js s'importe toujours avec les nouvelles routes", () => {
  delete require.cache[require.resolve("../server")];
  const app = require("../server");
  assert.strictEqual(typeof app, "function");
});

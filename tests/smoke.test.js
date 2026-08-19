"use strict";
const { test } = require("node:test");
const assert = require("node:assert");

// Ces tests protègent contre les régressions structurelles qui rendaient
// l'API non fonctionnelle (providers manquants, envelope, validation).

test("le router charge tous les providers (aucun require manquant)", () => {
  const { PROVIDERS, routeChat } = require("../lib/router");
  assert.ok(Array.isArray(PROVIDERS));
  const ids = PROVIDERS.map((p) => p.id).sort();
  assert.deepStrictEqual(ids, [
    "deepseek",
    "gemini",
    "groq",
    "mistral",
    "nvapi",
    "ollama",
    "opencode-go",
    "openrouter",
  ]);
  assert.strictEqual(typeof routeChat, "function");
  // Chaque provider expose generate + un modèle par défaut non vide.
  for (const p of PROVIDERS) {
    assert.strictEqual(typeof p.generate, "function", `${p.id}.generate`);
    assert.ok(p.defaultModel, `${p.id}.defaultModel`);
  }
});

test("chaque module provider se charge sans erreur", () => {
  for (const id of [
    "gemini",
    "groq",
    "nvapi",
    "deepseek",
    "openrouter",
    "mistral",
    "ollama",
    "opencode-go",
  ]) {
    const mod = require(`../lib/providers/${id}`);
    assert.strictEqual(typeof mod.generate, "function", `${id}.generate`);
    assert.ok(mod.DEFAULT_MODEL, `${id}.DEFAULT_MODEL`);
  }
});

test("envelope de réponse : structure normalisée", () => {
  const { envelope } = require("../lib/api-response");
  const ok = envelope("req-1", "actif", { a: 1 }, "ok");
  assert.deepStrictEqual(ok, {
    id: "req-1",
    statut: "actif",
    donnees: { a: 1 },
    message: "ok",
  });
  const err = envelope(null, "erreur", null, "boom");
  assert.strictEqual(err.id, null);
  assert.strictEqual(err.statut, "erreur");
  assert.strictEqual(err.donnees, null);
});

test("validateMessages : accepte un message user, rejette le vide", () => {
  const { validateMessages } = require("../lib/validate-chat");
  const good = validateMessages([{ role: "user", content: "salut" }]);
  assert.strictEqual(good.ok, true);
  assert.strictEqual(good.messages[0].content, "salut");

  assert.strictEqual(validateMessages([]).ok, false);
  assert.strictEqual(validateMessages("nope").ok, false);
  assert.strictEqual(
    validateMessages([{ role: "system", content: "x" }]).ok,
    false,
    "au moins un message user requis"
  );
});

test("server.js s'importe sans ouvrir de port et expose l'app express", () => {
  const app = require("../server");
  assert.strictEqual(typeof app, "function"); // app express = fonction
});

// Fabrique un res factice capturant status/json/headers (aucun port ouvert).
function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.body = obj;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

test("/v1 : un hint provider inconnu est rejeté (400) sans appel réseau", async () => {
  process.env.AI_SMART_ROUTER_HEADER_KEY = "test-secret-key";
  const handler = require("../api/v1-chat");
  const req = {
    method: "POST",
    headers: {
      "x-api-key": "test-secret-key",
      "x-ai-provider": "bogus-provider",
    },
    body: JSON.stringify({ messages: [{ role: "user", content: "salut" }] }),
  };
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body?.error?.message || "", /Provider inconnu/i);
});

test("/v1 : sans hint provider, le body est accepté jusqu'au routage (défaut)", async () => {
  process.env.AI_SMART_ROUTER_HEADER_KEY = "test-secret-key";
  // Neutralise toute clé provider pour rendre le test déterministe (force le
  // chemin « aucun provider configuré » -> 503, jamais un vrai appel réseau).
  for (const k of [
    "GEMINI_API_KEY", "GROQ_API_KEY", "NVAPI_API_KEY", "DEEPSEEK_API_KEY",
    "OPENROUTER_API_KEY", "MISTRAL_API_KEY", "OLLAMA_API_KEY", "OLLAMA_HOST",
    "OPENCODE_GO_API_KEY",
  ]) {
    delete process.env[k];
  }
  const handler = require("../api/v1-chat");
  const req = {
    method: "POST",
    headers: { "x-api-key": "test-secret-key" },
    body: JSON.stringify({ messages: [{ role: "user", content: "salut" }] }),
  };
  const res = mockRes();
  await handler(req, res);
  // Aucune clé provider configurée dans l'env de test -> routeChat renvoie 503
  // (« aucun provider configuré »), PAS 400 : la validation d'entrée a réussi
  // et le comportement par défaut (pas de restriction) est bien pris.
  assert.notStrictEqual(res.statusCode, 400);
});

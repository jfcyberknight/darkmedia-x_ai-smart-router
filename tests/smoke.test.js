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

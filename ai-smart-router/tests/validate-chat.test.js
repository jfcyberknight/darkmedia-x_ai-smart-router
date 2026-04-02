"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  validateBodySize,
  validateMessages,
  validateModelOverrides,
  MAX_MESSAGES,
  MAX_CONTENT_LENGTH,
} = require("../lib/validate-chat");

describe("validateBodySize", () => {
  it("accepte un body dans la limite", () => {
    const r = validateBodySize("hello");
    assert.equal(r.ok, true);
  });

  it("rejette un body string > 256 KB", () => {
    const big = "x".repeat(256 * 1024 + 1);
    const r = validateBodySize(big);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("accepte les non-strings sans vérifier la taille", () => {
    const r = validateBodySize({ foo: "bar" });
    assert.equal(r.ok, true);
  });

  it("accepte un body vide", () => {
    const r = validateBodySize("");
    assert.equal(r.ok, true);
  });
});

describe("validateMessages", () => {
  it("rejette si messages n'est pas un tableau", () => {
    assert.equal(validateMessages("hello").ok, false);
    assert.equal(validateMessages(null).ok, false);
    assert.equal(validateMessages(42).ok, false);
  });

  it("rejette si messages est vide", () => {
    const r = validateMessages([]);
    assert.equal(r.ok, false);
    assert.match(r.error, /vide/i);
  });

  it(`rejette si plus de ${MAX_MESSAGES} messages`, () => {
    const msgs = Array.from({ length: MAX_MESSAGES + 1 }, () => ({
      role: "user",
      content: "hi",
    }));
    const r = validateMessages(msgs);
    assert.equal(r.ok, false);
    assert.match(r.error, /maximum/i);
  });

  it("rejette un rôle invalide", () => {
    const r = validateMessages([{ role: "admin", content: "hi" }]);
    assert.equal(r.ok, false);
    assert.match(r.error, /role invalide/i);
  });

  it("rejette si aucun message user non vide", () => {
    const r = validateMessages([{ role: "assistant", content: "response" }]);
    assert.equal(r.ok, false);
    assert.match(r.error, /utilisateur/i);
  });

  it("accepte un message user valide", () => {
    const r = validateMessages([{ role: "user", content: "Bonjour" }]);
    assert.equal(r.ok, true);
    assert.equal(r.messages.length, 1);
    assert.equal(r.messages[0].role, "user");
    assert.equal(r.messages[0].content, "Bonjour");
  });

  it("accepte system + user", () => {
    const r = validateMessages([
      { role: "system", content: "You are helpful" },
      { role: "user", content: "Hello" },
    ]);
    assert.equal(r.ok, true);
    assert.equal(r.messages.length, 2);
  });

  it("accepte tous les rôles valides (user, assistant, system)", () => {
    const r = validateMessages([
      { role: "system", content: "Sys" },
      { role: "assistant", content: "Ans" },
      { role: "user", content: "Question" },
    ]);
    assert.equal(r.ok, true);
  });

  it(`rejette un contenu > ${MAX_CONTENT_LENGTH} caractères`, () => {
    const big = "x".repeat(MAX_CONTENT_LENGTH + 1);
    const r = validateMessages([{ role: "user", content: big }]);
    assert.equal(r.ok, false);
    assert.match(r.error, /trop long/i);
  });

  it("extrait le texte depuis un content en tableau", () => {
    const r = validateMessages([{ role: "user", content: [{ text: "Extracted" }] }]);
    assert.equal(r.ok, true);
    assert.equal(r.messages[0].content, "Extracted");
  });

  it("rejette un message dont l'objet est invalide", () => {
    const r = validateMessages([null]);
    assert.equal(r.ok, false);
  });

  it("trim le contenu du message", () => {
    const r = validateMessages([{ role: "user", content: "  Hello  " }]);
    assert.equal(r.ok, true);
    assert.equal(r.messages[0].content, "Hello");
  });
});

describe("validateModelOverrides", () => {
  it("retourne {} si null", () => {
    assert.deepEqual(validateModelOverrides(null), {});
  });

  it("retourne {} si undefined", () => {
    assert.deepEqual(validateModelOverrides(undefined), {});
  });

  it("retourne {} si non-objet (string)", () => {
    assert.deepEqual(validateModelOverrides("gemini"), {});
  });

  it("filtre les valeurs non-string", () => {
    const r = validateModelOverrides({ provider: "gemini", count: 3 });
    assert.deepEqual(r, { provider: "gemini" });
  });

  it("filtre les valeurs trop longues (> 200 chars)", () => {
    const longVal = "x".repeat(201);
    const r = validateModelOverrides({ model: longVal });
    assert.deepEqual(r, {});
  });

  it("accepte les overrides valides", () => {
    const r = validateModelOverrides({ gemini: "gemini-2.0-flash", groq: "llama3-8b" });
    assert.deepEqual(r, { gemini: "gemini-2.0-flash", groq: "llama3-8b" });
  });
});

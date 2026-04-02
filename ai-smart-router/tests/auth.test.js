"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

/** Mock du res Express (res.status().json()) */
function mockRes() {
  const r = { _status: null, _body: null };
  r.status = (code) => {
    r._status = code;
    return r;
  };
  r.json = (body) => {
    r._body = body;
    return r;
  };
  return r;
}

describe("checkApiSecret", () => {
  const savedSecret = process.env.API_SECRET;

  beforeEach(() => {
    // Vider le cache du module pour forcer la relecture des env vars
    delete require.cache[require.resolve("../lib/auth")];
  });

  afterEach(() => {
    if (savedSecret !== undefined) {
      process.env.API_SECRET = savedSecret;
    } else {
      delete process.env.API_SECRET;
    }
    delete require.cache[require.resolve("../lib/auth")];
  });

  it("rejette si API_SECRET non défini", () => {
    delete process.env.API_SECRET;
    const { checkApiSecret } = require("../lib/auth");

    const res = mockRes();
    const result = checkApiSecret({ headers: {} }, res);

    assert.equal(result, false);
    assert.equal(res._status, 401);
    assert.match(res._body.message, /API_SECRET/i);
  });

  it("rejette si API_SECRET trop court (< 8 chars)", () => {
    process.env.API_SECRET = "short";
    const { checkApiSecret } = require("../lib/auth");

    const res = mockRes();
    const result = checkApiSecret({ headers: {} }, res);

    assert.equal(result, false);
    assert.equal(res._status, 401);
  });

  it("rejette si token absent dans les headers", () => {
    process.env.API_SECRET = "supersecret123";
    const { checkApiSecret } = require("../lib/auth");

    const res = mockRes();
    const result = checkApiSecret({ headers: {} }, res);

    assert.equal(result, false);
    assert.equal(res._status, 401);
    assert.match(res._body.message, /manquante/i);
  });

  it("accepte un token valide via Authorization: Bearer", () => {
    process.env.API_SECRET = "supersecret123";
    const { checkApiSecret } = require("../lib/auth");

    const res = mockRes();
    const result = checkApiSecret(
      { headers: { authorization: "Bearer supersecret123" } },
      res
    );

    assert.equal(result, true);
  });

  it("accepte un token valide via X-API-Key", () => {
    process.env.API_SECRET = "supersecret123";
    const { checkApiSecret } = require("../lib/auth");

    const res = mockRes();
    const result = checkApiSecret(
      { headers: { "x-api-key": "supersecret123" } },
      res
    );

    assert.equal(result, true);
  });

  it("rejette un mauvais token", () => {
    process.env.API_SECRET = "supersecret123";
    const { checkApiSecret } = require("../lib/auth");

    const res = mockRes();
    const result = checkApiSecret(
      { headers: { "x-api-key": "wrongtoken123" } },
      res
    );

    assert.equal(result, false);
    assert.equal(res._status, 401);
    assert.match(res._body.message, /invalide/i);
  });

  it("préfère X-API-Key si les deux headers sont présents", () => {
    process.env.API_SECRET = "supersecret123";
    const { checkApiSecret } = require("../lib/auth");

    const res = mockRes();
    // X-API-Key correct, Authorization incorrect
    const result = checkApiSecret(
      { headers: { "x-api-key": "supersecret123", authorization: "Bearer wrongtoken" } },
      res
    );

    // X-API-Key est pris en priorité
    assert.equal(result, true);
  });
});

"use strict";

/**
 * Tests d'intégration pour l'API déployée sur Vercel.
 * Ces tests vérifient que les endpoints répondent correctement avec les bons formats.
 * 
 * Prérequis :
 * - API_BASE_URL (ex: https://mon-projet.vercel.app)
 * - API_SECRET (clé d'accès)
 * 
 * Lancement : 
 * TEST_DEPLOYED=true pnpm test
 */

const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Chargement manuel des variables d'environnement (check root then subfolder)
// On charge d'abord le subfolder puis on laisse le root écraser si besoin
const envPaths = [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env")
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length > 0) {
        const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
        // On autorise l'écrasement par les fichiers chargés plus tard (root a le dernier mot)
        process.env[key.trim()] = val;
      }
    }
  }
}

const BASE_URL = (process.env.API_BASE_URL || process.env.AI_SMART_ROUTER_URL || "https://ai-smart-router.vercel.app").replace(/\/$/, "");
const API_SECRET = process.env.API_SECRET;

// On ne lance ces tests que si explicitement demandé ou si les clés sont là
const skipTests = !process.env.TEST_DEPLOYED && !process.env.API_BASE_URL;

describe("🚀 Deployed API Integration Tests", { skip: skipTests }, () => {
  
  before(() => {
    if (!API_SECRET) {
      throw new Error("API_SECRET est requis pour tester l'API déployée.");
    }
    console.log(`📡 Testing API at: ${BASE_URL}`);
  });

  const authHeaders = {
    "Authorization": `Bearer ${API_SECRET}`,
    "Content-Type": "application/json"
  };

  it("GET /api/health - Devrait retourner l'état du service", async () => {
    const res = await fetch(`${BASE_URL}/api/health`, { headers: authHeaders });
    const data = await res.json();

    assert.equal(res.status, 200, "Le statut HTTP devrait être 200");
    assert.equal(data.statut, "actif", "Le statut de l'enveloppe devrait être 'actif'");
    assert.ok(data.donnees.ok, "donnees.ok devrait être true");
    assert.ok(Array.isArray(data.donnees.providers), "providers devrait être un tableau");
  });

  it("POST /api/chat - Devrait router une requête de chat", async () => {
    const payload = {
      messages: [{ role: "user", content: "Dis 'OK' en un mot." }]
    };

    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    assert.equal(res.status, 200, "Le statut HTTP devrait être 200");
    assert.equal(data.statut, "actif", "Le statut de l'enveloppe devrait être 'actif'");
    assert.ok(data.donnees.content, "La réponse devrait contenir du contenu");
    assert.ok(data.donnees.provider, "Le provider devrait être indiqué");
    assert.ok(data.donnees.model, "Le modèle devrait être indiqué");
  });

  it("POST /api/normalize - Devrait extraire des données structurées", async () => {
    const payload = {
      text: "Jean Dupont, score 95, le 12/05/2024"
    };

    const res = await fetch(`${BASE_URL}/api/normalize`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    assert.equal(res.status, 200, "Le statut HTTP devrait être 200");
    assert.equal(data.statut, "actif");
    
    // Le format est { statut: "actif", donnees: { id, statut, donnees: { nom, ... }, message }, message }
    const extraction = data.donnees;
    assert.ok(extraction, "Les données extraites devraient exister");
    assert.equal(typeof extraction.donnees.nom, "string", "Le nom devrait être une string");
    assert.ok(extraction.donnees.nom.includes("Dupont"), "Le nom devrait être extrait correctement");
  });

  it("POST /api/chat - Devrait échouer avec 401 si le secret est invalide", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { ...authHeaders, "Authorization": "Bearer invalid_secret" },
      body: JSON.stringify({ messages: [] })
    });

    assert.equal(res.status, 401, "Devrait retourner 401 Unauthorized");
  });

  it("GET /api/chat - Devrait échouer avec 405 (Méthode non autorisée)", async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "GET",
      headers: authHeaders
    });

    assert.equal(res.status, 405, "Devrait retourner 405 Method Not Allowed");
  });
});

#!/usr/bin/env node
/**
 * Script de test pour l'authentification client/serveur
 * Démontre comment utiliser X-Client-Key + X-Signature
 */

const crypto = require("crypto");

const CLIENT_KEY = process.env.CLIENT_KEY || "cli_example_key_12345";
const SERVER_SECRET = process.env.SERVER_SECRET || "secret_server_key_67890";
const API_URL = process.env.API_URL || "http://localhost:3000";

/**
 * Génère une signature HMAC-SHA256
 */
function generateSignature(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Teste l'endpoint /api/chat avec authentification client/serveur
 */
async function testChatEndpoint() {
  const messages = [
    {
      role: "user",
      content: "Dis-moi un numéro aléatoire entre 1 et 100",
    },
  ];

  const body = JSON.stringify({ messages });
  const timestamp = Date.now().toString();

  // Créer la signature avec : payload = body + timestamp
  const payload = `${body}:${timestamp}`;
  const signature = generateSignature(payload, SERVER_SECRET);

  console.log("\n=== Test d'authentification Client/Serveur ===\n");
  console.log("Configuration:");
  console.log(`  CLIENT_KEY: ${CLIENT_KEY}`);
  console.log(`  SERVER_SECRET: ${SERVER_SECRET}`);
  console.log(`  Timestamp: ${timestamp}`);
  console.log(`  Payload: ${payload}`);
  console.log(`  Signature: ${signature}\n`);

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Key": CLIENT_KEY,
        "X-Signature": signature,
        "X-Timestamp": timestamp,
      },
      body,
    });

    const data = await response.json();

    console.log("Réponse:", response.status);
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ Authentification réussie!");
    } else {
      console.log("\n❌ Authentification échouée");
    }
  } catch (error) {
    console.error("Erreur:", error.message);
  }
}

/**
 * Teste avec une signature invalide
 */
async function testInvalidSignature() {
  const messages = [{ role: "user", content: "Test" }];
  const body = JSON.stringify({ messages });
  const timestamp = Date.now().toString();

  // Signature intentionnellement mauvaise
  const invalidSignature = "aaaa0000ccccffff";

  console.log("\n=== Test avec signature invalide ===\n");

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Key": CLIENT_KEY,
        "X-Signature": invalidSignature,
        "X-Timestamp": timestamp,
      },
      body,
    });

    const data = await response.json();

    console.log("Réponse:", response.status);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log("\n✅ Signature invalide rejetée correctement");
    }
  } catch (error) {
    console.error("Erreur:", error.message);
  }
}

async function main() {
  console.log("🔐 Client/Serveur Authentication Test\n");

  // Test 1: Authentification valide
  await testChatEndpoint();

  // Test 2: Signature invalide
  // await testInvalidSignature();
}

main();

/**
 * Tests pour le provider Mistral AI – ai-smart-router
 * Lancez avec : node scripts/test-mistral.js
 */

const mistral = require("../lib/providers/mistral");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../../env") });

const COLORS = { green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m", cyan: "\x1b[36m", reset: "\x1b[0m" };
const ok  = (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`);
const fail = (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`);
const info = (msg) => console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${msg}`);

async function run() {
  console.log(`\n${COLORS.cyan}🤖 Tests Mistral AI Provider${COLORS.reset}\n`);

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    fail("MISTRAL_API_KEY non configurée dans env");
    process.exit(1);
  }
  ok(`Clé chargée: ${apiKey.slice(0, 8)}...`);

  // Test 1: modèle par défaut (mistral-small-latest)
  console.log("\n[1] Test mistral-small-latest (texte rapide)");
  try {
    const res = await mistral.generate({
      apiKey,
      messages: [{ role: "user", content: "Dis 'bonjour' en 5 mots max." }],
    });
    ok(`Réponse: "${res.text}"`);
    ok(`Provider: ${res.provider} | Modèle: ${res.model}`);
  } catch (e) {
    fail(`Erreur: ${e.message}`);
  }

  // Test 2: modèle large (créativité)
  console.log("\n[2] Test mistral-large-latest (narration horror)");
  try {
    const res = await mistral.generate({
      apiKey,
      model: "mistral-large-latest",
      messages: [{ role: "user", content: "Écris une phrase d'ambiance horror sombre en 20 mots." }],
    });
    ok(`Réponse: "${res.text}"`);
  } catch (e) {
    fail(`Erreur ${e.status ?? "?"}: ${e.message}`);
  }

  // Test 3: codestral (utile pour scripts)
  console.log("\n[3] Test codestral-latest (script Python 1 ligne)");
  try {
    const res = await mistral.generate({
      apiKey,
      model: "codestral-latest",
      messages: [{ role: "user", content: "Écris une ligne Python qui affiche la date du jour." }],
    });
    ok(`Réponse: "${res.text.trim()}"`);
  } catch (e) {
    fail(`Erreur ${e.status ?? "?"}: ${e.message}`);
  }

  // Test 4: erreur API (mauvaise clé)
  console.log("\n[4] Test détection erreur (mauvaise clé)");
  try {
    await mistral.generate({ apiKey: "fake-key", messages: [{ role: "user", content: "test" }] });
    fail("Devrait lever une erreur avec une fausse clé");
  } catch (e) {
    ok(`Erreur correctement levée: ${e.message.slice(0, 60)}`);
  }

  console.log(`\n${COLORS.green}✅ Tests Mistral terminés.${COLORS.reset}\n`);
}

run().catch((err) => {
  console.error(`\n${COLORS.red}❌ Crash:${COLORS.reset}`, err.message);
  process.exit(1);
});

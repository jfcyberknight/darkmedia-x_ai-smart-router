#!/usr/bin/env node
/**
 * Générateur de clés d'authentification Client/Serveur
 * Utilisation: node scripts/generate-auth-keys.js <project-name>
 *
 * Exemple:
 *   node scripts/generate-auth-keys.js ai-smart-router
 *
 * Sortie:
 *   CLIENT_KEY=cli_ai-smart-router_4fded216d19a2d394d1c1cc6eb9f811c
 *   SERVER_SECRET=sec_ai-smart-router_8d3dd9512bc724b49556f5f8b25929514718393f6df42efe
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Récupérer le nom du projet depuis les arguments
let projectName = process.argv[2];

if (!projectName) {
  // Si pas d'argument, utiliser le nom du package.json
  try {
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    projectName = pkg.name || "unknown-project";
  } catch (e) {
    console.error("❌ Erreur: Spécifiez le nom du projet");
    console.error("   Usage: node scripts/generate-auth-keys.js <project-name>");
    process.exit(1);
  }
}

// Valider le nom du projet (alphanumériques, tirets, underscores)
if (!/^[a-z0-9_-]+$/.test(projectName)) {
  console.error("❌ Nom de projet invalide. Utilisez: a-z, 0-9, tirets, underscores");
  process.exit(1);
}

// Générer les clés
const clientKey = "cli_" + projectName + "_" + crypto.randomBytes(16).toString("hex");
const serverSecret = "sec_" + projectName + "_" + crypto.randomBytes(24).toString("hex");

console.log("\n🔐 Clés d'authentification générées pour: " + projectName + "\n");
console.log("CLIENT_KEY=" + clientKey);
console.log("SERVER_SECRET=" + serverSecret);

console.log("\n📝 À ajouter dans .env ou Vercel Environment Variables:");
console.log("───────────────────────────────────────────────────────────");
console.log("CLIENT_KEY=" + clientKey);
console.log("SERVER_SECRET=" + serverSecret);

console.log("\n💡 Conseils de sécurité:");
console.log("   • CLIENT_KEY: clé publique (identifiant client) - peut être exposée");
console.log("   • SERVER_SECRET: clé secrète - JAMAIS commiter ou exposer");
console.log("   • Stocker SERVER_SECRET UNIQUEMENT dans des variables d'environnement");
console.log("   • Régénérer les clés tous les 3-6 mois");
console.log("   • En production: utiliser Vercel Environment Variables, pas .env\n");

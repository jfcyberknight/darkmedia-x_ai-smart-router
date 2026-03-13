#!/usr/bin/env node
/**
 * Teste chaque provider (Gemini, Groq) localement avec un même message.
 * Usage: node scripts/test-providers.js
 * Prérequis: .env avec au moins une clé (GEMINI_API_KEY et/ou GROQ_API_KEY).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const vars = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).replace(/\\n/g, '\n');
    }
    vars[key] = value;
  }
  return vars;
}

const TEST_MESSAGES = [
  { role: 'user', content: 'Réponds en une seule phrase : qu’est-ce qu’un microservice ?' },
];

function truncate(str, max = 120) {
  if (!str || typeof str !== 'string') return '(vide)';
  const s = str.trim();
  return s.length <= max ? s : s.slice(0, max) + '…';
}

async function run() {
  const env = loadEnv();
  if (!env.GEMINI_API_KEY && !env.GROQ_API_KEY) {
    console.error('❌ Aucune clé trouvée dans .env (GEMINI_API_KEY ou GROQ_API_KEY requise).');
    process.exit(1);
  }

  console.log('🧪 Test des providers (message unique pour chaque)\n');

  // Gemini
  if (env.GEMINI_API_KEY) {
    try {
      const gemini = require('../lib/providers/gemini');
      const out = await gemini.generate({
        apiKey: env.GEMINI_API_KEY,
        messages: TEST_MESSAGES,
      });
      console.log('✅ Gemini');
      console.log('   Réponse:', truncate(out.text));
      console.log('   Modèle:', out.model, '\n');
    } catch (e) {
      console.log('❌ Gemini');
      console.log('   Erreur:', e.message, '\n');
    }
  } else {
    console.log('⏭️  Gemini (GEMINI_API_KEY absente)\n');
  }

  // Groq
  if (env.GROQ_API_KEY) {
    try {
      const groq = require('../lib/providers/groq');
      const out = await groq.generate({
        apiKey: env.GROQ_API_KEY,
        messages: TEST_MESSAGES,
      });
      console.log('✅ Groq');
      console.log('   Réponse:', truncate(out.text));
      console.log('   Modèle:', out.model, '\n');
    } catch (e) {
      console.log('❌ Groq');
      console.log('   Erreur:', e.message, '\n');
    }
  } else {
    console.log('⏭️  Groq (GROQ_API_KEY absente)\n');
  }

  // Router (fallback)
  console.log('🔄 Test du router (fallback Gemini → Groq)');
  try {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || '';
    process.env.GROQ_API_KEY = env.GROQ_API_KEY || '';
    const { routeChat } = require('../lib/router');
    const result = await routeChat({ messages: TEST_MESSAGES });
    console.log('✅ Router');
    console.log('   Provider utilisé:', result.provider);
    console.log('   Réponse:', truncate(result.text));
    console.log('   Modèle:', result.model);
  } catch (e) {
    console.log('❌ Router');
    console.log('   Erreur:', e.message);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

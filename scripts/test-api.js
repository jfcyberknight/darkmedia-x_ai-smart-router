#!/usr/bin/env node
/**
 * Teste l'endpoint POST /api/chat (API locale ou déployée).
 * Usage: node scripts/test-api.js [URL]
 * Exemple: npm run dev (dans un autre terminal) puis npm run test:api
 * Par défaut: http://localhost:3000
 */

const base = process.argv[2] || 'http://localhost:3000';
const url = base.replace(/\/$/, '') + '/api/chat';

const body = JSON.stringify({
  messages: [{ role: 'user', content: 'Réponds en une phrase : qu’est-ce qu’un microservice ?' }],
});

async function run() {
  console.log('🧪 Test API:', url, '\n');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      console.log('❌ Erreur', res.status, data.error || data);
      process.exit(1);
    }
    console.log('✅ Statut:', res.status);
    console.log('   Provider:', data.provider);
    console.log('   Modèle:', data.model);
    console.log('   Réponse:', (data.content || '').trim().slice(0, 200) + (data.content?.length > 200 ? '…' : ''));
  } catch (e) {
    console.error('❌', e.message);
    if (e.cause?.code === 'ECONNREFUSED') {
      console.error('   Lancez l’API dans un autre terminal : npm run dev');
    }
    process.exit(1);
  }
}

run();

#!/usr/bin/env node
/**
 * Hook pre-push :
 * 1. Bloque le push direct vers main (obligation de passer par une PR).
 * 2. Sinon exécute env:sync avant de pousser (met à jour .env.example et pousse les variables vers Vercel).
 * Contourner (déconseillé) : git push --no-verify
 */
const path = require('path');
const { spawnSync } = require('child_process');
const readline = require('readline');

const root = path.resolve(__dirname, '../..');
const PROTECTED_REF = 'refs/heads/main';

function isPushingToMain() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
    let pushingToMain = false;
    rl.on('line', (line) => {
      const parts = line.trim().split(/\s+/);
      // format: local_ref local_sha remote_ref remote_sha
      if (parts[2] === PROTECTED_REF) pushingToMain = true;
    });
    rl.on('close', () => resolve(pushingToMain));
  });
}

async function main() {
  const pushingToMain = await isPushingToMain();
  if (pushingToMain) {
    console.error('\n❌ Push direct vers main interdit.');
    console.error('   Créez une branche, poussez-la et ouvrez une Pull Request vers main.');
    console.error('   Exemple: git checkout -b ma-feature && git push -u origin ma-feature\n');
    process.exit(1);
  }

  const r = spawnSync('npm', ['run', 'env:sync'], {
    stdio: 'inherit',
    cwd: root,
    shell: process.platform === 'win32',
  });
  process.exit(r.status !== null ? r.status : 1);
}

main();

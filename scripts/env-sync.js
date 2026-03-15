#!/usr/bin/env node
/**
 * Synchronise les clés du .env de la branche courante :
 * 1. Met à jour .env.example avec les noms des nouvelles clés (sans valeur)
 * 2. Si le projet n'est pas lié à Vercel, lance automatiquement vercel link --yes
 * 3. Pousse les variables vers Vercel (environnement selon branche : local→development, preview→preview, main→production)
 *
 * Usage: npm run env:sync
 * Fichier utilisé : .env.local (branche local), .env.preview (branche preview), .env.production (branche main).
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { getEnvFilePath, getVercelEnv, getCurrentBranch, getEnvFileName } = require('./env-resolver');

const ROOT = path.resolve(__dirname, '..');
const EXAMPLE_FILE = path.join(ROOT, '.env.example');
const VERCEL_PROJECT_JSON = path.join(ROOT, '.vercel', 'project.json');

const EXCLUDE = new Set(['NODE_ENV', 'DEBUG', 'VERCEL', 'CI', 'API_SECRET']);

function isVercelLinked() {
  try {
    return fs.existsSync(VERCEL_PROJECT_JSON) && fs.readFileSync(VERCEL_PROJECT_JSON, 'utf8').trim().length > 0;
  } catch {
    return false;
  }
}

function runVercelLink() {
  return new Promise((resolve, reject) => {
    console.log('🔗 Projet non lié à Vercel. Exécution de vercel link --yes...\n');
    const child = spawn('vercel', ['link', '--yes'], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`vercel link a quitté avec le code ${code}`));
    });
  });
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function getKeysFromEnvContent(content) {
  const keys = new Set();
  for (const line of (content || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) keys.add(trimmed.slice(0, eq).trim());
  }
  return keys;
}

function runVercelPush(envFile, vercelEnv) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [path.join(__dirname, 'vercel-env-push.js'), envFile, '--env', vercelEnv], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  const branch = getCurrentBranch();
  const ENV_FILE = getEnvFilePath(ROOT);
  const vercelEnv = getVercelEnv();
  const envFileName = getEnvFileName();

  if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ Fichier', envFileName, 'introuvable (branche:', branch, ').');
    process.exit(1);
  }

  const envVars = parseEnvFile(ENV_FILE);
  const envKeys = [...Object.keys(envVars)].filter((k) => !EXCLUDE.has(k) && envVars[k] !== '');
  let exampleContent = fs.existsSync(EXAMPLE_FILE) ? fs.readFileSync(EXAMPLE_FILE, 'utf8') : '';
  const exampleKeys = getKeysFromEnvContent(exampleContent);
  const toAdd = envKeys.filter((k) => !exampleKeys.has(k));

  if (toAdd.length > 0) {
    const toAppend = '\n# Ajoutées par env:sync\n' + toAdd.map((k) => `${k}=`).join('\n') + '\n';
    exampleContent = exampleContent.trimEnd() + toAppend;
    fs.writeFileSync(EXAMPLE_FILE, exampleContent);
    console.log('📝 .env.example mis à jour avec:', toAdd.join(', '));
  } else {
    console.log('📝 .env.example déjà à jour.');
  }

  console.log('\n📤 Pousse vers Vercel (' + vercelEnv + ') depuis', envFileName, '...\n');
  if (!isVercelLinked()) {
    try {
      await runVercelLink();
      console.log('');
    } catch (err) {
      console.error('\n❌', err.message);
      console.error('   Liez le projet avec: vercel link (ou vercel link --scope <team> --yes)');
      console.error('   Puis relancez: npm run env:sync\n');
      process.exit(1);
    }
  }
  await runVercelPush(ENV_FILE, vercelEnv);
  console.log('\n✅ Synchronisation terminée (Vercel', vercelEnv, '+ .env.example).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

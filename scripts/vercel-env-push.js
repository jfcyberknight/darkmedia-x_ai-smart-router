#!/usr/bin/env node
/**
 * Pousse les variables d'environnement depuis un fichier .env vers Vercel.
 * Usage: node scripts/vercel-env-push.js [fichier.env] [--env production|preview|development]
 * Par défaut : .env.preview et environnement preview.
 *
 * Prérequis:
 *   1. vercel CLI installée et connectée (vercel login)
 *   2. Projet lié à un projet Vercel (vercel link) — à faire une fois par dépôt
 * Par défaut, toutes les clés du .env (valeur non vide) sont poussées, sauf celles listées dans EXCLUDE.
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function getCurrentGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim() || 'main';
  } catch {
    return 'main';
  }
}

// Variables à ne pas pousser vers Vercel (clé fournie par les clients, à définir manuellement dans Vercel si besoin)
const EXCLUDE = new Set(['NODE_ENV', 'DEBUG', 'VERCEL', 'CI', 'API_SECRET']);

// Par défaut : preview (scripts du projet utilisent preview)
const ENVIRONMENTS = ['preview'];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('❌ Fichier introuvable:', filePath);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
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

function addToVercel(name, value, environment, gitBranch) {
  const args = ['env', 'add', name, environment];
  if (environment === 'preview' && gitBranch) args.push(gitBranch);
  args.push('--yes', '--force');
  return new Promise((resolve, reject) => {
    const child = spawn(
      'vercel',
      args,
      {
        cwd: ROOT,
        stdio: ['pipe', 'inherit', 'pipe'],
        shell: process.platform === 'win32',
      }
    );
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      const err = new Error(`exit ${code}`);
      err.stderr = stderr;
      reject(err);
    });
    child.stdin.write(value, () => child.stdin.end());
  });
}

async function main() {
  const args = process.argv.slice(2);
  let envFile = path.join(ROOT, '.env.preview');
  let envFilter = ENVIRONMENTS;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && args[i + 1]) {
      envFilter = args[i + 1].split(',').map((e) => e.trim());
      i++;
    } else if (!args[i].startsWith('--')) {
      envFile = path.isAbsolute(args[i]) ? args[i] : path.join(process.cwd(), args[i]);
    }
  }

  const vars = parseEnvFile(envFile);
  const toPush = Object.keys(vars).filter(
    (k) => !EXCLUDE.has(k) && vars[k] != null && String(vars[k]).trim() !== ''
  );
  if (toPush.length === 0) {
    console.log('⚠️ Aucune variable à pousser (fichier vide ou valeurs vides).');
    process.exit(0);
  }

  const notLinked = /not_linked|isn't linked|isn't linked to a project/i;
  const gitBranch = getCurrentGitBranch();
  if (envFilter.includes('preview')) {
    console.log('📤 Envoi vers Vercel:', toPush.join(', '), '| environnements:', envFilter.join(', '), '| branche preview:', gitBranch);
  } else {
    console.log('📤 Envoi vers Vercel:', toPush.join(', '), '| environnements:', envFilter.join(', '));
  }
  for (const name of toPush) {
    const value = vars[name];
    for (const env of envFilter) {
      try {
        await addToVercel(name, value, env, env === 'preview' ? gitBranch : null);
        console.log('  ✅', name, '→', env + (env === 'preview' ? ` (${gitBranch})` : ''));
      } catch (e) {
        if (e.stderr && notLinked.test(e.stderr)) {
          console.error('\n❌ Le projet n\'est pas lié à Vercel.');
          console.error('   Exécutez d\'abord : vercel link');
          console.error('   Puis relancez : npm run env:push\n');
          process.exit(1);
        }
        const skipPreview = env === 'preview' && e.stderr && (
          /git_branch_required|does not have a connected Git repository/i.test(e.stderr)
        );
        if (skipPreview) {
          console.warn('  ⚠️', name, '→ preview ignoré (connexion Git requise sur Vercel)');
        } else {
          console.error('  ❌', name, env, e.message);
        }
      }
    }
  }
  console.log('✅ Terminé.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

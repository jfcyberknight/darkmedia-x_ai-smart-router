#!/usr/bin/env node
/**
 * Détermine le fichier .env et l'environnement Vercel selon la branche Git courante.
 * Branches : local → .env.local (Vercel development), preview → .env.preview (Vercel preview), main → .env.production (Vercel production).
 * Toute autre branche → .env.preview + preview.
 */

const path = require('path');
const { execSync } = require('child_process');

const BRANCH_TO_ENV = {
  local: '.env.local',
  preview: '.env.preview',
  main: '.env.production',
};

const BRANCH_TO_VERCEL = {
  local: 'development',
  preview: 'preview',
  main: 'production',
};

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim() || 'preview';
  } catch {
    return 'preview';
  }
}

/**
 * Chemin du fichier .env à utiliser pour la branche courante.
 * @param {string} root - Racine du dépôt
 * @returns {string} Chemin absolu vers .env.local, .env.preview ou .env.production
 */
function getEnvFilePath(root) {
  const branch = getCurrentBranch();
  const fileName = BRANCH_TO_ENV[branch] || '.env.preview';
  return path.join(root, fileName);
}

/**
 * Environnement Vercel cible pour la branche courante (production | preview | development).
 */
function getVercelEnv() {
  const branch = getCurrentBranch();
  return BRANCH_TO_VERCEL[branch] || 'preview';
}

/**
 * Nom du fichier .env (sans chemin) pour la branche courante.
 */
function getEnvFileName() {
  const branch = getCurrentBranch();
  return BRANCH_TO_ENV[branch] || '.env.preview';
}

module.exports = {
  getCurrentBranch,
  getEnvFilePath,
  getVercelEnv,
  getEnvFileName,
  BRANCH_TO_ENV,
  BRANCH_TO_VERCEL,
};

#!/usr/bin/env node
/**
 * Configure la protection de la branche main via GitHub CLI (gh).
 * Règle : obliger une Pull Request avant merge, pas de push direct.
 *
 * Prérequis : gh installé et authentifié (gh auth login).
 * Usage : node scripts/configure-branch-protection.js [branch]
 *         Par défaut : branch = main
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    cwd: opts.cwd || ROOT,
    shell: process.platform === 'win32',
  });
  return { stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim(), status: r.status };
}

function main() {
  const gh = run('gh', ['--version']);
  if (gh.status !== 0) {
    console.error('❌ GitHub CLI (gh) n’est pas installé ou pas dans le PATH.');
    console.error('   Install : https://cli.github.com/ puis gh auth login');
    process.exit(1);
  }

  const auth = run('gh', ['auth', 'status']);
  if (auth.status !== 0) {
    console.error('❌ gh n’est pas authentifié. Exécutez : gh auth login');
    process.exit(1);
  }

  let nameWithOwner;
  try {
    nameWithOwner = execSync('gh repo view --json nameWithOwner -q .nameWithOwner', {
      encoding: 'utf8',
      cwd: ROOT,
    }).trim();
  } catch (e) {
    console.error('❌ Impossible de détecter le dépôt (pas un clone GitHub ou repo non lié).');
    process.exit(1);
  }

  let BRANCH = process.argv[2];
  if (!BRANCH) {
    try {
      BRANCH = execSync('gh repo view --json defaultBranchRef -q .defaultBranchRef.name', {
        encoding: 'utf8',
        cwd: ROOT,
      }).trim();
    } catch (e) {
      BRANCH = 'main';
    }
    console.log('Branche par défaut du dépôt :', BRANCH);
  }

  const payload = {
    required_status_checks: null,
    enforce_admins: false,
    required_pull_request_reviews: {
      dismiss_stale_reviews: false,
      require_code_owner_reviews: false,
      required_approving_review_count: 0,
    },
    restrictions: null,
    allow_force_pushes: false,
    allow_deletions: false,
  };

  const url = `repos/${nameWithOwner}/branches/${BRANCH}/protection`;
  const r = spawnSync('gh', ['api', '--method', 'PUT', url, '--input', '-'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    cwd: ROOT,
    shell: process.platform === 'win32',
  });

  if (r.status !== 0) {
    console.error('❌ Échec de la configuration de la protection pour', BRANCH);
    if (r.stderr) console.error(r.stderr);
    if (r.stdout) console.error(r.stdout);
    process.exit(1);
  }

  console.log('✅ Protection configurée pour la branche', BRANCH);
  console.log('   • Pull Request obligatoire avant merge');
  console.log('   • Aucune approbation requise (required_approving_review_count: 0)');
  console.log('   • Admins non exemptés (enforce_admins: false)');
  console.log('\n   Pour exiger des approbations, modifiez le script ou réglez dans GitHub Settings → Branches.');
}

main();

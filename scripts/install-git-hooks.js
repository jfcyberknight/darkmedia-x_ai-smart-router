#!/usr/bin/env node
/**
 * Installe les hooks Git (pre-push → env:sync).
 * Appelé automatiquement après npm install via le script "prepare".
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const hooksDir = path.join(root, ".git", "hooks");
if (!fs.existsSync(path.join(root, ".git"))) {
  process.exit(0);
}
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const hooks = [
  {
    name: "pre-push",
    content: `#!/bin/sh\ncd "$(git rev-parse --show-toplevel)" && node scripts/git-hooks/pre-push.js\nexit $?\n`
  },
  {
    name: "pre-commit",
    content: `#!/bin/sh\ncd "$(git rev-parse --show-toplevel)" && node scripts/git-hooks/pre-commit.js\nexit $?\n`
  }
];

hooks.forEach(hook => {
  const hookPath = path.join(hooksDir, hook.name);
  let needsWrite = !fs.existsSync(hookPath);
  if (!needsWrite) {
    try {
      needsWrite = fs.readFileSync(hookPath, "utf8") !== hook.content;
    } catch {
      needsWrite = true;
    }
  }
  if (needsWrite) {
    fs.writeFileSync(hookPath, hook.content, "utf8");
    console.log(`✅ Hook ${hook.name} installé.`);
  }
  try {
    fs.chmodSync(hookPath, 0o755);
  } catch (_) {}
});

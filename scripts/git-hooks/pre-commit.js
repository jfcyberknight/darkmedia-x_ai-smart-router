#!/usr/bin/env node
/**
 * Hook pre-commit : lance les tests avant chaque commit.
 */
const { spawn } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");

console.log("🔍 Vérification avant commit (tests unitaires)...");

const test = spawn("pnpm", ["test"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: process.platform === "win32"
});

test.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Tests réussis. Commit autorisé.\n");
    process.exit(0);
  } else {
    console.log("\n❌ Les tests ont échoué. Corrigez les erreurs avant de commiter.");
    console.log("   (ou utilisez --no-verify si vous savez ce que vous faites)");
    process.exit(1);
  }
});

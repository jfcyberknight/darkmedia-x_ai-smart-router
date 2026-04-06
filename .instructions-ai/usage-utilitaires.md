# AI Instructions: @jfcyberknight/utilitaires Integration

> [!IMPORTANT]
> **OBSELETE SCRIPTS**: This package officially replaces all previous RAG sync scripts including `push_with_rag.py`, `rag-push.py`, and `push.py`. 
> AI agents MUST ONLY use the commands defined below.

## 📦 Installation & Registry Setup

To use this scoped package, ensure the `.npmrc` file is configured for the GitHub Packages registry:

```bash
# .npmrc
@jfcyberknight:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
npm install @jfcyberknight/utilitaires
```

## 🛰️ RAG (Retrieval Augmented Generation) Integration

This package provides a direct CLI for synchronizing local files with the Darkmedia-X RAG index.

### 1. Synchronization Command
Sync the current directory (or specific files) to the global RAG memory:
```bash
npx dmx-util rag sync ./docs
```
Alternatively, use the built-in npm script:
```bash
npm run rag-update
```

### 2. Automated Git Push Sync
The recommended way to keep the RAG index up to date is via the `push-sync` script:
```bash
npm run push-sync
```
This command: 
1. Performs a `git push`.
2. Automatically triggers RAG indexing for modified files.

## 🛠️ Provided Utilities

- **`pc_turbo_boost.ps1`**: Windows optimization and performance tuning.
- **`setup_qdrant.ps1`**: Automated configuration of Qdrant Cloud collections.
- **`publish.ps1`**: Local distribution and version tagging.

## 🏷️ Standards (Darkmedia-X)

- **Version Bump**: ONLY increment version in `package.json` when performing an official release (using `npm run dist`).
- **Regular Updates**: For standard code changes or documentation updates, do NOT increment the version. Use `npm run push-sync` to synchronize changes with the RAG index and the repository.
- **CI/CD**: The GitHub Actions workflow (`publish.yml`) requires `packages: write` permissions.
- **Encoding**: All PowerShell scripts must be encoded in **UTF-8 with BOM** for cross-platform compatibility.

## 🚀 AI Deployment Agent Actions

### A. Workflow: Regular Updates (Bug fixes, Features, Docs)
1. Do NOT increment the version in `package.json`.
2. Push your changes using `npm run push-sync`.

### B. Workflow: Official Package Release (Publication)
1. Verify `NODE_AUTH_TOKEN` is present in environment variables.
2. Manually increment the version in `package.json` (Bump Patch/Minor/Major).
3. Run `npm run dist` to generate local release artifacts in `💼_Distribution`.
4. Finalize by pushing everything via `npm run push-sync`.

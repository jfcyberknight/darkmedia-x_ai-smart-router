# Agent Memory — darkmedia-x_ai-smart-router

## Quick project context
- Vercel-hosted API that routes AI chat requests through **OpenRouter only** (simplified). If the primary model rate-limits (429/quota), it automatically falls back to free models fetched dynamically from OpenRouter.
- Two parallel codebases: root (workspace config, RAG scripts, shared tooling) and `ai-smart-router/` (actual deployable serverless app). Tests and providers live in the router package.

## Critical dev commands (non‑obvious)
- `pnpm test` from **root fails** — the root `package.json` references test files that don't exist at root (`tests/router.test.js`, `tests/providers.test.js`). The working tests are in `ai-smart-router/tests/`.
  - Run tests from `ai-smart-router/`: `cd ai-smart-router && pnpm test` (validate-chat, auth, deployed).
  - `pnpm run test:providers` — tests provider keys + modules (no server). Safe to run from `ai-smart-router/`.
  - `pnpm run test:api` — starts dev server (`vercel dev`) then runs HTTP test against `/api/chat`.
  - `pnpm run test:api:prod` — tests deployed prod endpoint (default: `ai-smart-router.vercel.app`).
- `npm run env:sync` / `pnpm run env:sync` — sync `.env` → `.env.example` + push all vars to Vercel (dev + production). Pre‑push hook runs this automatically.
- `python scripts/generate-api-secret.py` — generate a secure `API_SECRET`.
- `npm run rag:index` / `npm run rag:push` — RAG index/push workflows (Python scripts at root).

## Environment & deployment essentials
- `API_SECRET` is **required**; without it every request returns 401.
- `OPENROUTER_API_KEY` must be set for chat, image fallback, TTS fallback, and normalize.
- `REPLICATE_API_KEY` must be set for image, video, and TTS (uses "Try for Free" free models first).
- `.env` variables are **not** automatically synced to Vercel — run `npm run env:sync` or use `npm run env:push`.
- Pre‑push git hook runs `env:sync`; bypass with `git push --no-verify`.
- Pre‑commit hook runs `pnpm test` from root, which currently fails because root test files are missing. Use `git commit --no-verify` to skip if needed.
- Vercel rewrites differ between root (`/` → `/api/landing`) and `ai-smart-router/` (`/` → `/api/health`). The deployed app uses `ai-smart-router/vercel.json`.

## Architecture & routing details
- Router lives in `ai-smart-router/lib/router.js`. **OpenRouter is the primary provider** for chat. **Replicate is the primary provider** for image, video, and TTS (using "Try for Free" free models). For every request, **free models are tried first**, then fallback to paid models, then switch provider.
- Provider modules live in `ai-smart-router/lib/providers/` (openrouter for chat; replicate for image/video/tts; fal is fallback for video only).
- **OpenRouter free models**: fetched dynamically from `https://openrouter.ai/api/v1/models` every hour (cached).
- **Replicate free models**: static list of "Try for Free" models (google/imagen-4, black-forest-labs/flux-dev, minimax/video-01, resemble-ai/chatterbox, etc.).
- Two auth systems coexist:
  1. Legacy: `Authorization: Bearer <API_SECRET>` or `X-API-Key: <API_SECRET>`.
  2. Client HMAC: `X-Client-Key`, `X-Signature`, `X-Timestamp` (env vars `CLIENT_KEY_AI_SMART_ROUTER` / `SERVER_SECRET_AI_SMART_ROUTER`).

## Testing quirks
- Tests are Node `--test` spec files in `ai-smart-router/tests/` (validate-chat, auth, deployed).
- `pnpm test` from `ai-smart-router/` only runs a subset (`validate-chat`, `auth`, `deployed`). Use `pnpm run test:providers` for full provider coverage.
- `test:api` / `test:api:prod` require the server to be reachable — they start the dev server or call the deployed URL.
- `deployed.test.js` is skipped unless `TEST_DEPLOYED=true` is set.

## Repository boundaries
- Root manifests (`package.json`, `vercel.json`, scripts) control tooling and env distribution. Root `package.json` declares `workspaces: ["ai-smart-router"]` but there is no `pnpm-workspace.yaml`, so pnpm warns and treats it as a plain project.
- `ai-smart-router/` is the deployable Vercel app; everything inside that folder is the actual service. It has its own `package.json`, `vercel.json`, and duplicated scripts.
- Both `package.json` versions should stay in sync (currently `2.0.26`).
- Secrets/keys never committed — always set via Vercel dashboard or `env:sync` with a local `.env`.

## Important conventions
- Keep a Changelog (`CHANGELOG.md`) — required by project standards.
- Semantic versioning in both `package.json` files → `version`.
- READMEs exist at both root and `ai-smart-router/`; keep them aligned with actual commands and behaviour.
- GitHub Actions workflow (`.github/workflows/npm-publish.yml`) publishes the `ai-smart-router` package to GitHub Packages (`npm.pkg.github.com`, scope `@jfcyberknight`) on every push to `main` or `dev`.

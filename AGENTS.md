# Agent Memory — darkmedia-x_ai-smart-router

## Quick project context
- Vercel-hosted API that routes AI chat requests across multiple providers (Gemini, Groq, NVAPI, DeepSeek, OpenRouter, Mistral) with **randomised order + automatic fallback** on 429/500/503 or quota errors.
- Two parallel codebases: root (scripts/config) and `ai-smart-router/` (actual serverless app). Tests target the router package.

## Critical dev commands (non‑obvious)
- `npm run env:sync` — sync `.env` → `.env.example` + push all vars to Vercel (dev + production). Pre‑push hook runs this automatically.
- `npm run test:providers` — tests only provider keys + modules (no server). Equivalent: `npm test`.
- `npm run test:api` — starts dev server (`vercel dev`) then runs HTTP test against `/api/chat`.
- `npm run test:api:prod` — tests deployed prod endpoint (default: `ai-smart-router.vercel.app`).
- `python scripts/generate-api-secret.py` — generate a secure `API_SECRET`.
- `npm run rag:index` / `npm run rag:push` — RAG index/push workflows.

## Environment & deployment essentials
- `API_SECRET` is **required**; without it every request returns 401.
- At least one provider key (e.g. `GEMINI_API_KEY` or `GROQ_API_KEY`) must be set for the router to have any usable providers.
- `.env` variables are **not** automatically synced to Vercel — run `npm run env:sync` or use `npm run env:push`.
- Pre‑push git hook runs `env:sync`; bypass with `git push --no-verify`.
- Vercel rewrites defined in `vercel.json` route `/` → `/api/landing` and `/api/(.*)` → `/api/$1`.

## Architecture & routing details
- Router lives in `ai-smart-router/lib/router.js`. Providers are shuffled (Fisher‑Yates) per request; fallback is sequential.
- Provider modules live in `ai-smart-router/lib/providers/` (gemini, groq, nvapi, deepseek, openrouter, mistral, etc.).
- Ollama provider is special: it works if either `OLLAMA_API_KEY` is set **or** `OLLAMA_HOST` is defined.
- Adding a new provider: create `lib/providers/<id>.js`, export `generate({ apiKey, model, messages })`, add to `PROVIDERS` array in `lib/router.js`, and document its env key in `.env.example`.

## Testing quirks
- Tests are Node `--test` spec files in `ai-smart-router/tests/` (validate-chat, auth, router, providers, deployed).
- `npm run test` only runs a subset (`validate-chat`, `auth`, `router`). Use `npm run test:providers` for full provider coverage.
- `test:api`/`test:api:prod` require the server to be reachable — they start the dev server or call the deployed URL.

## Repository boundaries
- Root manifests (package.json, vercel.json, scripts) control tooling and env distribution.
- `ai-smart-router/` is the deployable Vercel app; everything inside that folder is the actual service.
- Secrets/keys never committed — always set via Vercel dashboard or `env:sync` with a local `.env`.

## Important conventions
- Keep a Changelog (`CHANGELOG.md`) — required by project standards.
- Semantic versioning in `package.json` → `version`.
- README is considered the source of truth; keep it aligned with actual commands and behaviour.
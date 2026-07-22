# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [Unreleased]

### Added
- **Façade `/v1` — ciblage explicite de provider (opt-in)** : la façade
  OpenAI-compatible `/v1/chat/completions` honore désormais un **hint provider**
  (champ `provider` dans le body ou en-tête `X-AI-Provider`). Quand il est
  fourni, le router se restreint à ce provider et **respecte le `model`** envoyé
  (ex. `openrouter` / `openrouter/fusion`) — permettant à une app d'imposer un
  modèle précis tout en égressant par le router (clés centralisées). Sans hint,
  le comportement par défaut (modèle ignoré, ordre aléatoire + fallback) est
  **inchangé**. Provider inconnu → `400`. Doc dans `API.md`/`openapi.json`.

### Security
- **`index_rag.py`** : suppression de la clé API Qdrant **committée en clair** ;
  `QDRANT_URL`/`QDRANT_API_KEY` sont désormais lues dans l'environnement. ⚠️
  L'ancienne clé exposée doit être révoquée.

### Changed
- **Gemini** : passage à l’API REST (`X-goog-api-key`, modèle `gemini-flash-latest`) à la place du SDK ; suppression de la dépendance `@google/generative-ai`.

### Added
- Protection par clé API (**API_SECRET**) : accès restreint à l’API. Seules les requêtes avec `Authorization: Bearer <API_SECRET>` ou `X-API-Key: <API_SECRET>` sont acceptées. `/api/chat` et `/api/health` protégés. `lib/auth.js` + doc dans README et `.env.example`.
- Application des standards **prompt-ai** (Gardien du README + Architecte Documentation) : structure du projet documentée, CHANGELOG Keep a Changelog.

### Changed
- (À remplir)

### Fixed
- (À remplir)

### Removed
- (À remplir)

---

## [2.0.0] - 2025-03-13

### Added
- API Vercel : endpoint `POST /api/chat` et `GET /api/health`.
- Router multi-providers avec fallback (Gemini → Groq).
- Providers : `lib/providers/gemini.js`, `lib/providers/groq.js`.
- Scripts : `env:push` (pousse .env vers Vercel), `env:sync` (sync .env + .env.example + Vercel), `test:providers`, `test:api`.
- Configuration Vercel (`vercel.json`) pour les fonctions serverless dans `api/`.

### Changed
- Documentation README alignée avec la structure et les commandes réelles.

### Fixed
- Gestion de l’environnement preview (branche Git / non lié) dans env:push.
- Détection « not_linked » avec message clair pour `vercel link`.

---

*Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).*

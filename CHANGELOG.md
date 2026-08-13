# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [Unreleased]

### Added — Performance & Observabilité
- **Cache LRU + TTL** des réponses de chat (`lib/cache.js`) : les requêtes
  texte identiques sont court-circuitées (hit ~2 ms au lieu de 350 ms–3 s).
  Variables : `CACHE_ENABLED` (défaut `true`), `CACHE_TTL_SECONDS` (défaut 30),
  `CACHE_MAX_ENTRIES` (défaut 256). Le multimodal n'est jamais caché.
- **Timeout par provider** (`lib/http.js`, `fetchWithTimeout` + `AbortController`) :
  au-delà de `PROVIDER_TIMEOUT_MS` (défaut 25 s), l'appel est aborté et le
  router bascule sur le provider suivant. Les erreurs réseau (DNS, connexion
  refusée) sont normalisées en 503 retryable — auparavant elles remontaient
  sans `status` et le router échouait immédiatement sans fallback.
- **`ROUTER_PREFERRED_PROVIDER`** (défaut `openrouter`) : provider testé en
  premier. Pour réduire la variabilité de latence, cibler un provider direct
  plus rapide (ex. `groq`).
- **Limiteur de concurrence** (`lib/concurrency.js`) : au-delà de
  `MAX_CONCURRENT_REQUESTS` (défaut 64), renvoie 503 + `Retry-After`. Protège
  le conteneur contre un pic de requêtes en vol.
- **Métriques Prometheus** (`lib/metrics.js` + `GET /metrics`) : compteurs par
  statut HTTP, par provider (tentatives/succès/erreurs), hits/misses cache,
  jauge de concurrence, histogramme de latence. Endpoint protégé par clé
  partagée.
- **Scripts de benchmark** : `npm run bench` (Node, sans dépendance) et
  `npm run bench:wrk` (wrk multi-thread, pour tests de charge poussés).

### Changed
- **Router** : le cache lookup est effectué **avant** la vérification de
  disponibilité des providers — un hit cache ne nécessite aucun provider
  configuré.
- **Router** : l'ordre des providers n'est plus aléatoire mais priorise
  `ROUTER_PREFERRED_PROVIDER` (défaut `openrouter`), puis fallback.
- **Tous les providers** (7) : utilisent `fetchWithTimeout` au lieu de `fetch`
  nu, avec propagation du `timeoutMs` depuis le router.
- **`/api/chat` et `/v1/chat/completions`** : la réponse inclut désormais un
  champ `cached: true` quand le résultat provient du cache.

### Façade `/v1` — ciblage explicite de provider (opt-in)
- La façade OpenAI-compatible `/v1/chat/completions` honore désormais un **hint
  provider** (champ `provider` dans le body ou en-tête `X-AI-Provider`). Quand
  il est fourni, le router se restreint à ce provider et **respecte le `model`**
  envoyé (ex. `openrouter` / `openrouter/fusion`) — permettant à une app
  d'imposer un modèle précis tout en égressant par le router (clés
  centralisées). Sans hint, le comportement par défaut (modèle ignoré, ordre
  aléatoire + fallback) est **inchangé**. Provider inconnu → `400`. Doc dans
  `API.md`/`openapi.json`.

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

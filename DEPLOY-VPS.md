# Déploiement privé sur le VPS OVH

L'`ai-smart-router` s'auto-héberge sur le VPS OVH (`vps-c4db969c.vps.ovh.ca`)
en conteneur Docker, **strictement privé** : il n'est joignable que par tes
autres applications du VPS, jamais depuis Internet.

## Modèle de confidentialité

Aucun port public, pas de 80/443, pas de tunnel Cloudflare. Deux voies d'accès,
toutes deux internes au serveur :

| Consommateur | Comment il appelle l'API |
|--------------|--------------------------|
| App **conteneurisée** (autre stack Docker) | rejoint le réseau `dmx-net` et appelle `http://dmx-ai-router:8080` |
| Processus **sur l'hôte** (hors Docker) / diagnostic | `http://127.0.0.1:8781` (loopback uniquement) |

Le conteneur écoute sur `0.0.0.0:8080` **à l'intérieur** du réseau Docker ; la
seule publication vers l'hôte est `127.0.0.1:8781`. Rien n'est exposé sur l'IP
publique du VPS.

## Authentification

Toutes les routes métier exigent le secret partagé (`AI_SMART_ROUTER_HEADER_KEY`) :

```
Authorization: Bearer <AI_SMART_ROUTER_HEADER_KEY>
```

(`GET /api/health` reste public pour les sondes.)

## Mise en service (première fois)

Sur le VPS :

```bash
# 1. Cloner l'app
sudo mkdir -p /opt/darkmedia-x_ai-smart-router
sudo chown "$(id -u):$(id -g)" /opt/darkmedia-x_ai-smart-router
git clone https://github.com/jfcyberknight/darkmedia-x_ai-smart-router.git \
  /opt/darkmedia-x_ai-smart-router
cd /opt/darkmedia-x_ai-smart-router

# 2. Créer le .env (secrets — jamais committé)
cp .env.example .env
# éditer .env : AI_SMART_ROUTER_HEADER_KEY + au moins une clé provider

# 3. Réseau interne partagé (idempotent)
docker network inspect dmx-net >/dev/null 2>&1 || docker network create dmx-net

# 4. Build + démarrage
docker compose up -d --build

# 5. Vérifier (loopback privé)
curl -s http://127.0.0.1:8781/api/health
```

## Déploiements suivants (automatiques)

Chaque **push sur `main`** déclenche `.github/workflows/deploy-vps.yml` :
SSH sur le VPS → `git reset --hard origin/main` → `docker compose up -d --build`
→ vérif santé sur `127.0.0.1:8781`. Le `.env` du serveur n'est jamais touché.

Secrets/variables GitHub requis (dépôt `darkmedia-x_ai-smart-router`) :

- Secret `VPS_SSH_KEY` — clé privée SSH (identique à VPS Ops).
- Secret `VPS_KNOWN_HOSTS` — *(optionnel)* empreinte hôte (sinon TOFU).
- Variables `VPS_HOST` / `VPS_USER` / `VPS_PORT` — *(optionnel)* défauts
  `vps-c4db969c.vps.ovh.ca` / `ubuntu` / `22`.

## Comment une autre app du VPS consomme le router

Dans le `docker-compose.yml` de l'app consommatrice :

```yaml
services:
  mon-app:
    # ...
    environment:
      AI_SMART_ROUTER_URL: http://dmx-ai-router:8080
      AI_SMART_ROUTER_HEADER_KEY: ${AI_SMART_ROUTER_HEADER_KEY}
    networks:
      - default
      - dmx-net

networks:
  dmx-net:
    external: true
```

Puis, côté code :

```js
await fetch("http://dmx-ai-router:8080/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.AI_SMART_ROUTER_HEADER_KEY}`,
  },
  body: JSON.stringify({ messages: [{ role: "user", content: "Bonjour" }] }),
});
```

**Intérêt central** : le jour où un provider change (ex. OpenRouter retire le
slug `:free`), tu corriges **uniquement** `lib/providers/*.js` ici — toutes les
apps qui passent par le router en bénéficient sans modification.

## Endpoints

| Route | Méthode | Auth | Rôle |
|-------|---------|------|------|
| `/api/health` (et `/`) | GET | publique | état + providers actifs |
| `/api/chat` | POST | 🔒 | conversation IA (fallback multi-provider) |
| `/api/normalize` | POST | 🔒 | texte libre → JSON structuré |
| `/api/tts` | POST | 🔒 | synthèse vocale (si clé TTS configurée) |

Voir [`API.md`](API.md) pour les schémas de requête/réponse détaillés.

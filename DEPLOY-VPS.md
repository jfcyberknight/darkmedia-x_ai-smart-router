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

## Mise en service — via GitHub Secrets (aucun login serveur requis)

Le `.env` de prod est **construit par le CI** à partir des GitHub Secrets, puis
poussé sur le serveur (canal SSH chiffré, fichier en `600`). Il suffit donc de
renseigner les secrets, puis de lancer le workflow.

1. Dépôt `darkmedia-x_ai-smart-router` → **Settings → Secrets and variables →
   Actions** → ajouter :

   | Secret | Obligatoire | Rôle |
   |--------|-------------|------|
   | `VPS_SSH_KEY` | ✅ | Clé privée SSH du VPS (identique à VPS Ops) |
   | `AI_SMART_ROUTER_HEADER_KEY` | ✅ | Secret d'auth partagé (≥ 8 car.) |
   | `GEMINI_API_KEY` / `GROQ_API_KEY` / `NVAPI_API_KEY` / `DEEPSEEK_API_KEY` / `OPENROUTER_API_KEY` / `MISTRAL_API_KEY` | ⚠️ au moins un | Clés providers |
   | `OLLAMA_API_KEY` / `OLLAMA_HOST` | ⬜ | Ollama (cloud/local) |
   | `ELEVENLABS_API_KEY` / `TOGETHER_API_KEY` / `TTS_API_KEY` / `TTS_API_URL` | ⬜ | Active `/api/tts` |
   | `VPS_KNOWN_HOSTS` | ⬜ | Empreinte hôte (sinon TOFU) |

   Variables optionnelles : `VPS_HOST` / `VPS_USER` / `VPS_PORT`
   (défauts `vps-c4db969c.vps.ovh.ca` / `ubuntu` / `22`).

2. Lancer le déploiement : **Actions → « Deploy VPS (ai-smart-router privé) » →
   Run workflow** (ou pousser un commit sur `master`).

Le workflow : clone/maj sur le VPS → écrit `/opt/.../.env` depuis les secrets →
`docker network create dmx-net` (idempotent) → `docker compose up -d --build` →
vérifie `http://127.0.0.1:8781/api/health` (200).

## Déploiements suivants

Chaque **push sur `master`** rejoue le même workflow (le `.env` est réécrit
depuis les secrets à jour). Rien à faire côté serveur.

### Variante manuelle (sans CI)

Si tu préfères gérer le `.env` à la main sur le serveur :

```bash
sudo mkdir -p /opt/darkmedia-x_ai-smart-router
sudo chown "$(id -u):$(id -g)" /opt/darkmedia-x_ai-smart-router
git clone https://github.com/jfcyberknight/darkmedia-x_ai-smart-router.git \
  /opt/darkmedia-x_ai-smart-router
cd /opt/darkmedia-x_ai-smart-router
cp .env.example .env   # remplir header key + ≥1 clé provider
docker network create dmx-net
docker compose up -d --build
curl -s http://127.0.0.1:8781/api/health
```

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

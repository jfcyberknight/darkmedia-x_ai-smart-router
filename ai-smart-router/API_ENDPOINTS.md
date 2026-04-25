# AI Smart Router — Endpoints Reference

> Fournir ce document à un autre agent AI pour qu'il puisse consommer l'API correctement.

---

## Base URL

- **Production** : `https://darkmedia-xapi-ai-smart-router.vercel.app`
- **Local** : `http://localhost:3000`

---

## Authentification

Tous les endpoints (sauf `/api/health`) nécessitent l'une des méthodes suivantes :

### 1. Legacy (Bearer token)
```
Authorization: Bearer <API_SECRET>
```

### 2. Legacy (API Key header)
```
X-API-Key: <API_SECRET>
```

### 3. Client HMAC (nouveau système)
```
X-Client-Key: <CLIENT_KEY_AI_SMART_ROUTER>
X-Signature: <hmac-sha256-signature>
X-Timestamp: <unix-timestamp>
```

> Sans authentification valide → **401 Unauthorized**

---

## Logique de fallback (toutes les routes)

**OpenRouter est le seul provider utilisé.** Pour chaque requête :

1. **Essaye d'abord les modèles gratuits** disponibles sur OpenRouter (récupérés dynamiquement)
2. Si tous les gratuits échouent (429, quota, 500, 503), **fallback sur le modèle payant par défaut**

La liste des modèles gratuits est mise en cache pendant 1 heure.

---

## Endpoints

### 1. Chat Completion

**POST** `/api/chat`

Génère une réponse texte. Priorité : modèles gratuits OpenRouter → `meta-llama/llama-3.1-70b-instruct` (payant).

#### Headers
```
Content-Type: application/json
Authorization: Bearer <API_SECRET>
```

#### Body
```json
{
  "messages": [
    { "role": "user", "content": "Explique les microservices en une phrase." }
  ],
  "model": "meta-llama/llama-3.1-70b-instruct"
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `messages` | array | **Oui** | Tableau de messages `{role, content}` (roles: `user`, `assistant`, `system`) |
| `model` | string | Non | Modèle payant de fallback. Défaut: `meta-llama/llama-3.1-70b-instruct`. **Les modèles gratuits sont essayés en premier.** |

#### Réponse 200
```json
{
  "id": "req-a1b2c3d4",
  "statut": "actif",
  "message": "Réponse générée",
  "donnees": {
    "content": "Les microservices sont...",
    "provider": "openrouter",
    "model": "meta-llama/llama-3.3-70b-instruct:free"
  }
}
```

---

### 2. Image Generation

**POST** `/api/image`

Génère une image à partir d'un prompt texte. Priorité : modèles image gratuits OpenRouter (flux, dall-e:free, etc.) → `openai/dall-e-3` (payant).

#### Headers
```
Content-Type: application/json
Authorization: Bearer <API_SECRET>
```

#### Body
```json
{
  "prompt": "A dark cyberpunk cityscape at night, neon lights, rain",
  "model": "openai/dall-e-3",
  "enhance": false
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `prompt` | string | **Oui** | Description texte de l'image à générer |
| `model` | string | Non | Modèle payant de fallback. Défaut: `openai/dall-e-3`. **Les modèles gratuits sont essayés en premier.** |
| `enhance` | boolean | Non | Enrichit le prompt via le chat router avant génération. Défaut: `false` |

#### Réponse 200
```json
{
  "id": "req-a1b2c3d4",
  "statut": "actif",
  "message": "Image générée avec succès (google/gemma-3-4b-it:free)",
  "donnees": {
    "imageUrl": "https://...",
    "provider": "openrouter",
    "model": "google/gemma-3-4b-it:free"
  }
}
```

---

### 3. Text-to-Speech (TTS)

**POST** `/api/tts`

Synthétise du texte en audio. Priorité : modèles TTS gratuits OpenRouter → `elevenlabs/eleven-turbo-v2` (payant).

#### Headers
```
Content-Type: application/json
Authorization: Bearer <API_SECRET>
```

#### Body
```json
{
  "text": "Bonjour, bienvenue dans l'univers DarkMedia-X.",
  "voice": "alloy",
  "model": "elevenlabs/eleven-turbo-v2"
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `text` | string | **Oui** | Texte à synthétiser (max 1000 caractères) |
| `voice` | string | Non | ID de voix. Défaut: `alloy` |
| `model` | string | Non | Modèle payant de fallback. Défaut: `elevenlabs/eleven-turbo-v2`. **Les modèles gratuits sont essayés en premier.** |

#### Réponse 200
```json
{
  "id": "req-a1b2c3d4",
  "statut": "actif",
  "message": "Audio généré avec succès (cartesia/sonic-2:free)",
  "donnees": {
    "audio": "//uQZ... (base64)",
    "contentType": "audio/mp3"
  }
}
```

---

### 4. Video Generation

**POST** `/api/video`

Génère une vidéo à partir d'un prompt ou d'une image. **Nécessite Fal.ai** (`FAL_KEY`) — OpenRouter ne propose pas encore de modèles vidéo natifs.

#### Headers
```
Content-Type: application/json
Authorization: Bearer <API_SECRET>
```

#### Body
```json
{
  "prompt": "A cinematic horror scene, dark atmosphere, fog",
  "image_url": "https://example.com/source-image.jpg",
  "model": "fal-ai/fast-svd-lcm",
  "enhance": false
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `prompt` | string | **Oui*** | Prompt texte pour la vidéo (*requis si `image_url` absent) |
| `image_url` | string | **Oui*** | Image source pour image-to-video (*requis si `prompt` absent) |
| `model` | string | Non | Modèle Fal.ai. Défaut: `fal-ai/fast-svd-lcm` |
| `enhance` | boolean | Non | Enrichit le prompt via le chat router. Défaut: `false` |

#### Réponse 200
```json
{
  "id": "req-a1b2c3d4",
  "statut": "actif",
  "message": "Vidéo générée avec succès (fal)",
  "donnees": {
    "videoUrl": "https://fal.media/...",
    "provider": "fal",
    "model": "fal-ai/fast-svd-lcm"
  }
}
```

---

### 5. Text Normalization (JSON Extraction)

**POST** `/api/normalize`

Extrait des données structurées (JSON) à partir d'un texte libre via le router chat (OpenRouter).

#### Headers
```
Content-Type: application/json
Authorization: Bearer <API_SECRET>
```

#### Body
```json
{
  "text": "L'utilisateur Jean Dupont a fini son test avec 85% aujourd'hui le 13 mars 2026."
}
```

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `text` | string | **Oui** | Texte à analyser et normaliser (max 32 KB) |

#### Réponse 200
```json
{
  "id": "req-a1b2c3d4",
  "statut": "actif",
  "message": "Données extraites",
  "donnees": {
    "id": "USR-001",
    "statut": "actif",
    "donnees": {
      "nom": "Jean Dupont",
      "score": 85,
      "date_iso": "2026-03-13"
    },
    "message": "Test terminé avec succès"
  }
}
```

---

### 6. Health Check

**GET** `/api/health`

Vérifie l'état du service. **Public** (pas d'authentification requise).

#### Réponse 200
```json
{
  "id": null,
  "statut": "actif",
  "message": "Service opérationnel",
  "donnees": {
    "ok": true,
    "service": "ai-smart-router",
    "providers": ["openrouter"]
  }
}
```

---

## Envelope Commun (toutes les réponses)

Toutes les réponses suivent ce format :

```json
{
  "id": "string|null — identifiant de requête",
  "statut": "actif|inactif|erreur",
  "message": "string — description du résultat",
  "donnees": { ... } | null
}
```

---

## Codes d'erreur communs

| Code | Signification |
|------|---------------|
| `400` | Bad Request (body invalide, champ manquant) |
| `401` | Unauthorized (API_SECRET manquant ou invalide) |
| `405` | Method Not Allowed |
| `413` | Payload Too Large |
| `422` | Unprocessable Entity (réponse modèle invalide) |
| `500` | Erreur serveur interne |
| `502` | Tous les modèles ont échoué |
| `503` | Service non configuré (clé API manquante) |

---

## Variables d'environnement requises côté serveur

| Variable | Description |
|----------|-------------|
| `API_SECRET` | Clé secrète pour l'authentification (min. 8 caractères) |
| `OPENROUTER_API_KEY` | **Clé API OpenRouter** — utilisée pour chat, image, TTS, normalize |
| `FAL_KEY` | Clé API Fal.ai — **uniquement pour la génération vidéo** |

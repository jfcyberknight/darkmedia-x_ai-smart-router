# Client AI Smart Router

Client JavaScript/Node.js pour utiliser l'API AI Smart Router dans vos projets.

## Installation

Copier le fichier `lib/client-ai-smart-router.js` dans votre projet:

```bash
cp lib/client-ai-smart-router.js ../mon-projet/lib/
```

Ou importer depuis ce projet:

```javascript
const AISmartRouterClient = require('../ai-smart-router/lib/client-ai-smart-router');
```

## Utilisation

### Initialisation

**Option 1: Configuration explicite**

```javascript
const AISmartRouterClient = require('./lib/client-ai-smart-router');

const client = new AISmartRouterClient({
  baseURL: 'https://ai-smart-router.vercel.app',
  clientKey: 'cli_ai-smart-router_4fded216d19a2d394d1c1cc6eb9f811c',
  serverSecret: 'sec_ai-smart-router_8d3dd9512bc724b49556f5f8b25929514718393f6df42efe'
});
```

**Option 2: Variables d'environnement par projet (recommandé)**

```javascript
const AISmartRouterClient = require('./lib/client-ai-smart-router');

const client = new AISmartRouterClient({
  baseURL: 'https://ai-smart-router.vercel.app',
  project: 'ai-smart-router'  // Charge CLIENT_KEY_AI_SMART_ROUTER et SERVER_SECRET_AI_SMART_ROUTER
});
```

Variables d'environnement requises:
```
CLIENT_KEY_AI_SMART_ROUTER=cli_ai-smart-router_...
SERVER_SECRET_AI_SMART_ROUTER=sec_ai-smart-router_...
```

### Chat (Générer une réponse IA)

```javascript
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Dis-moi un numéro aléatoire' }
  ]
});

console.log(response);
// {
//   id: 'req_abc123...',
//   statut: 'succès',
//   donnees: {
//     content: '42',
//     provider: 'gemini',
//     model: 'gemini-2.0-flash'
//   },
//   message: 'Réponse générée'
// }
```

### Normalize (Extraire données structurées)

```javascript
const result = await client.normalize(
  'Jean Dupont a fini son test avec 85% aujourd\'hui le 13 mars 2026'
);

console.log(result.donnees);
// {
//   id: 'USR-001',
//   statut: 'actif',
//   donnees: {
//     nom: 'Jean Dupont',
//     score: 85,
//     date_iso: '2026-03-13'
//   },
//   message: 'Test terminé avec succès'
// }
```

### Image (Générer une image)

```javascript
const image = await client.image({
  prompt: 'Un chat noir avec des yeux verts',
  model: 'openai/dall-e-3',
  enhance: true
});

console.log(image.donnees.imageUrl);
```

### Health Check

```javascript
const health = await client.health();
console.log(health);
// { ok: true, service: 'ai-smart-router', providers: ['gemini', 'groq', ...] }
```

## Gestion des clés

### Générer de nouvelles clés

```bash
node scripts/generate-auth-keys.js mon-projet
```

Format des clés:
- `CLIENT_KEY=cli_<project>_<random>`
- `SERVER_SECRET=sec_<project>_<random>`

### Par projet

Créer une instance distincte pour chaque projet (variables d'env par projet):

```javascript
// Projet 1: AI Smart Router
const aiRouter = new AISmartRouterClient({
  baseURL: 'https://ai-smart-router.vercel.app',
  project: 'ai-smart-router'  // Charge CLIENT_KEY_AI_SMART_ROUTER et SERVER_SECRET_AI_SMART_ROUTER
});

// Projet 2: Mon App
const myApp = new AISmartRouterClient({
  baseURL: 'https://ai-smart-router.vercel.app',
  project: 'mon-app'  // Charge CLIENT_KEY_MON_APP et SERVER_SECRET_MON_APP
});
```

Variables d'environnement requises:
```
# Projet 1
CLIENT_KEY_AI_SMART_ROUTER=cli_ai-smart-router_...
SERVER_SECRET_AI_SMART_ROUTER=sec_ai-smart-router_...

# Projet 2
CLIENT_KEY_MON_APP=cli_mon-app_...
SERVER_SECRET_MON_APP=sec_mon-app_...
```

## Sécurité

⚠️ **Important:**

- **CLIENT_KEY**: clé publique (identifiant du client) - peut être exposée
- **SERVER_SECRET**: clé secrète - **JAMAIS commiter ou exposer**

### Bonnes pratiques

1. **Variables d'environnement**:
```javascript
const client = new AISmartRouterClient({
  baseURL: process.env.AI_API_URL,
  clientKey: process.env.CLIENT_KEY,
  serverSecret: process.env.SERVER_SECRET
});
```

2. **Fichier `.env`** (jamais commiter):
```
AI_API_URL=https://ai-smart-router.vercel.app
CLIENT_KEY=cli_mon-projet_...
SERVER_SECRET=sec_mon-projet_...
```

3. **Fichier `.env.example`** (template):
```
AI_API_URL=https://ai-smart-router.vercel.app
CLIENT_KEY=cli_mon-projet_YOUR_CLIENT_KEY_HERE
SERVER_SECRET=sec_mon-projet_YOUR_SERVER_SECRET_HERE
```

## Gestion des erreurs

```javascript
try {
  const response = await client.chat({
    messages: [{ role: 'user', content: 'Test' }]
  });
} catch (error) {
  console.error('Erreur API:', error.message);
  // API Error 401: Signature invalide ou manquante.
  // API Error 500: Erreur lors du routage vers les APIs IA.
}
```

## Exemples complets

### Node.js / Express

```javascript
const express = require('express');
const AISmartRouterClient = require('./lib/client-ai-smart-router');

const app = express();
const client = new AISmartRouterClient({
  baseURL: process.env.AI_API_URL,
  clientKey: process.env.CLIENT_KEY,
  serverSecret: process.env.SERVER_SECRET
});

app.post('/ask', async (req, res) => {
  try {
    const response = await client.chat({
      messages: req.body.messages
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Next.js API Route

```javascript
// pages/api/chat.js
import AISmartRouterClient from '@/lib/client';

const client = new AISmartRouterClient({
  baseURL: process.env.AI_API_URL,
  clientKey: process.env.CLIENT_KEY,
  serverSecret: process.env.SERVER_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const response = await client.chat({
      messages: req.body.messages
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Support

Pour plus de détails sur l'authentification:
- Voir [AUTH.md](./AUTH.md)

Pour la documentation des endpoints:
- Voir [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

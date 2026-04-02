# Authentification API - Client/Serveur + Clé Secrète

## 📋 Vue d'ensemble

L'API supporte **deux systèmes d'authentification** :

1. **Nouveau (Recommandé)** : Clé Client + Signature HMAC + Timestamp
2. **Ancien (Compatibilité)** : Clé API Simple

---

## 🔐 Système 1 : Client/Serveur (Recommandé)

### Principe

- **Client Key** (publique) : identifie le client
- **Server Secret** (privée) : clé secrète côté serveur
- **Signature HMAC-SHA256** : preuve de possession du secret
- **Timestamp** (optionnel) : protection contre les attaques par rejeu

### Flux

1. Client prépare la requête (body JSON)
2. Client crée un **payload** = `body + ":" + timestamp`
3. Client génère une **signature** = HMAC-SHA256(payload, SERVER_SECRET)
4. Client envoie la requête avec les headers :
   - `X-Client-Key`: la clé cliente
   - `X-Signature`: la signature générée
   - `X-Timestamp`: timestamp Unix en millisecondes
5. Serveur vérifie : HMAC-SHA256(payload, SERVER_SECRET) == signature fournie
6. Serveur vérifie que le timestamp n'est pas trop ancien (±5 minutes par défaut)

### Configuration (Variables d'environnement Vercel)

```bash
CLIENT_KEY=cli_example_key_12345
SERVER_SECRET=secret_server_key_67890
```

### Exemple : POST /api/chat

#### JavaScript (Node.js / Fetch)

```javascript
const crypto = require("crypto");

const CLIENT_KEY = "cli_example_key_12345";
const SERVER_SECRET = "secret_server_key_67890";
const messages = [
  {
    role: "user",
    content: "Dis-moi un numéro entre 1 et 100",
  },
];

const body = JSON.stringify({ messages });
const timestamp = Date.now().toString();
const payload = `${body}:${timestamp}`;

// Générer la signature
const signature = crypto
  .createHmac("sha256", SERVER_SECRET)
  .update(payload)
  .digest("hex");

// Requête
const response = await fetch("https://yourapi.vercel.app/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Client-Key": CLIENT_KEY,
    "X-Signature": signature,
    "X-Timestamp": timestamp,
  },
  body,
});

const result = await response.json();
console.log(result);
```

#### Python

```python
import json
import hmac
import hashlib
import time
import requests

CLIENT_KEY = "cli_example_key_12345"
SERVER_SECRET = "secret_server_key_67890"

messages = [{"role": "user", "content": "Dis-moi un numéro entre 1 et 100"}]
body = json.dumps({"messages": messages})
timestamp = str(int(time.time() * 1000))
payload = f"{body}:{timestamp}"

# Générer la signature
signature = hmac.new(
    SERVER_SECRET.encode(),
    payload.encode(),
    hashlib.sha256
).hexdigest()

# Requête
response = requests.post(
    "https://yourapi.vercel.app/api/chat",
    json={"messages": messages},
    headers={
        "X-Client-Key": CLIENT_KEY,
        "X-Signature": signature,
        "X-Timestamp": timestamp,
    },
)

print(response.json())
```

#### cURL

```bash
#!/bin/bash

CLIENT_KEY="cli_example_key_12345"
SERVER_SECRET="secret_server_key_67890"
TIMESTAMP=$(date +%s%N | cut -b1-13)  # milliseconds
BODY='{"messages":[{"role":"user","content":"Test"}]}'
PAYLOAD="${BODY}:${TIMESTAMP}"

# Générer la signature (HMAC-SHA256)
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SERVER_SECRET" -hex | cut -d' ' -f2)

# Requête
curl -X POST https://yourapi.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Client-Key: $CLIENT_KEY" \
  -H "X-Signature: $SIGNATURE" \
  -H "X-Timestamp: $TIMESTAMP" \
  -d "$BODY"
```

### Avantages

✅ **Sécurisé** : La clé secrète n'est jamais transmise
✅ **Timbre-poste** : Protection contre les rejeux (replay attacks)
✅ **Performant** : Validation HMAC très rapide
✅ **Scalable** : Pas d'état serveur requis (stateless)

---

## 🗝️ Système 2 : Clé API Simple (Ancien)

### Configuration

```bash
API_SECRET=myapisecretkey123
```

### Usage

**Headers acceptés :**
- `Authorization: Bearer <API_SECRET>`
- `X-API-Key: <API_SECRET>`

#### Exemple

```bash
curl -X POST https://yourapi.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer myapisecretkey123" \
  -d '{"messages":[{"role":"user","content":"Test"}]}'
```

### Inconvénients

⚠️ La clé secrète est transmise en clair (risque d'interception)
⚠️ Pas de protection contre les rejeux
⚠️ À utiliser uniquement en développement ou sur HTTPS

---

## 🔄 Migration depuis ancien système

1. **Garder compatibilité** : Les deux systèmes coexistent
2. **Générer nouvelles clés** :
   - `CLIENT_KEY` : clé publique pour identifier le client
   - `SERVER_SECRET` : clé secrète pour signer les requêtes
3. **Mettre à jour les clients** :
   - Remplacer `API_SECRET` par `X-Client-Key` + `X-Signature`
   - Ajouter `X-Timestamp`

---

## 📊 Format des réponses

Toutes les réponses sont au format **envelope commun** :

```json
{
  "id": "req_abc123...",
  "statut": "succès",
  "donnees": {
    "content": "...",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  },
  "message": "Réponse générée"
}
```

En cas d'erreur d'authentification :

```json
{
  "id": "req_error",
  "statut": "erreur",
  "donnees": null,
  "message": "Clé client invalide ou manquante."
}
```

---

## 🧪 Test

Utilisez le script fourni :

```bash
# Avec variables d'env
CLIENT_KEY=cli_example_key_12345 \
SERVER_SECRET=secret_server_key_67890 \
API_URL=http://localhost:3000 \
node scripts/test-client-auth.js
```

---

## ⚙️ Configuration Vercel

1. Aller dans **Settings → Environment Variables**
2. Ajouter :
   - `CLIENT_KEY`: `cli_example_key_12345`
   - `SERVER_SECRET`: `secret_server_key_67890`
3. (Optionnel) Garder `API_SECRET` pour compatibilité arrière

---

## 🛡️ Bonnes pratiques

### Sécurité

- ✅ Régénérer `SERVER_SECRET` tous les 3 à 6 mois
- ✅ Utiliser HTTPS en production
- ✅ Stocker `CLIENT_KEY` et `SERVER_SECRET` dans des variables d'environnement
- ✅ Ne jamais commiter les clés en dur dans le code

### Performance

- ✅ Le timestamp n'est pas obligatoire (mais recommandé)
- ✅ Les signatures HMAC-SHA256 sont très rapides
- ✅ Pas de lookups en base de données

---

## 📚 Endpoints

### `/api/chat` (POST)
Génère une réponse IA via le routeur de providers

### `/api/normalize` (POST)
Extrait et normalise des données textuelles en JSON

### `/api/image` (POST)
Génère des images via Fal.ai ou OpenRouter

### `/api/health` (GET)
Vérification de santé (public, pas d'auth)

---

## 🔗 Voir aussi

- [README.md](./README.md) - Vue d'ensemble de l'API
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentation détaillée des endpoints
- [CHANGELOG.md](./CHANGELOG.md) - Historique des modifications

# 🔐 Directives de Sécurité

**Version**: 2.0 | **Niveau**: Enterprise | **Compliance**: OWASP Top 10

---

## 🚨 [SECRETS] Gestion des Secrets

### Jamais en Dur dans le Code

```python
# ❌ MAUVAIS — Secrets exposés!
API_KEY = "sk-1234567890abcdefgh"
DATABASE_PASSWORD = "SuperSecret123"
OAUTH_CLIENT_SECRET = "secret_key_exposed"

# ✅ BON — Variables d'environnement
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
OAUTH_CLIENT_SECRET = os.getenv("OAUTH_CLIENT_SECRET")
```

### Fichier `.env` (NE PAS COMMITTER)

```env
API_KEY=sk_live_xxxxx_actual_key
DATABASE_PASSWORD=super_secure_password_123
QDRANT_API_KEY=qdrant_live_key_xxxxx
JWT_SECRET=your_super_secret_jwt_key_here
OAUTH_CLIENT_ID=client_id_from_provider
OAUTH_CLIENT_SECRET=client_secret_from_provider
```

### Fichier `.env.example` (À COMMITTER)

```env
API_KEY=your_api_key_here
DATABASE_PASSWORD=your_password_here
QDRANT_API_KEY=your_qdrant_key
JWT_SECRET=your_jwt_secret
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
```

### `.gitignore` (Protection Critique)

```
# Secrets et credentials
.env
.env.local
.env.*.local
*.key
*.pem
*.p12
*.jks

# Credentials files
~/.aws
~/.ssh
credentials.json
secrets.json

# IDE
.vscode/settings.json
.idea/
*.swp

# Node/Python
node_modules/
venv/
__pycache__/
*.egg-info/

# Logs (peuvent contenir des secrets)
logs/
*.log
```

---

## 🔑 [AUTH] Authentification et Autorisation

### Jamais de Mots de Passe en Clair

```powershell
# ❌ MAUVAIS
$password = "SuperSecret123"
$credential = New-Object PSCredential -ArgumentList "user", ($password | ConvertTo-SecureString -AsPlainText -Force)

# ✅ BON — SecureString
$securePassword = Read-Host -AsSecureString -Prompt "Entrez le mot de passe"
$credential = New-Object PSCredential -ArgumentList "username", $securePassword
```

### Password Hashing avec Bcrypt

```python
# ✅ TOUJOURS hasher les mots de passe
from bcrypt import hashpw, checkpw, gensalt

# Créer un hash
hashed = hashpw(password.encode(), gensalt(rounds=12))

# Vérifier le mot de passe
is_valid = checkpw(password.encode(), hashed)

# Stocker en base de données
db.users.insert({
    "email": email,
    "password_hash": hashed.decode()  # Ne pas stocker le plaintext!
})
```

### JWT Tokens avec Expiration

```typescript
// ✅ JWT sécurisé avec expiration courte
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { 
    expiresIn: '1h',           // Expiration courte
    algorithm: 'HS256',         // Algorithme sûr
    issuer: 'darkmedia-x',
    audience: 'api-consumers'
  }
);

// Vérification
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### OAuth2 / OpenID Connect

```typescript
// ✅ Déléguer l'authentification à un provider externe
import { OAuth2Strategy } from 'passport-oauth2';

const strategy = new OAuth2Strategy(
  {
    authorizationURL: process.env.OAUTH_AUTH_URL,
    tokenURL: process.env.OAUTH_TOKEN_URL,
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,  // Depuis .env!
    callbackURL: '/auth/callback',
    scope: ['openid', 'profile', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
    // Créer ou mettre à jour l'utilisateur en base
    User.findOrCreate({ googleId: profile.id }, (err, user) => {
      done(err, user);
    });
  }
);
```

---

## 🛡️ [INJECTION] Prévention des Injections

### SQL Injection

```python
# ❌ MAUVAIS — Concaténation (SQL Injection!)
query = f"SELECT * FROM users WHERE id = {user_id}"
cursor.execute(query)

# ✅ BON — Parameterized queries
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
```

### Command Injection

```powershell
# ❌ MAUVAIS — Injection possible
$filePath = Read-Host "Entrez le chemin"
Invoke-Expression "Get-Content $filePath"

# ✅ BON — Utiliser les cmdlets directement
$filePath = Read-Host "Entrez le chemin"
Get-Content -Path $filePath -ErrorAction Stop
```

### Template/String Injection

```typescript
// ❌ MAUVAIS — Injection XSS possible
const html = `<div>${userInput}</div>`;
document.body.innerHTML = html;

// ✅ BON — Échapper ou utiliser textContent
const div = document.createElement('div');
div.textContent = userInput;  // Texte, pas HTML
document.body.appendChild(div);
```

### NoSQL Injection

```python
# ❌ MAUVAIS — Injection possible
db.users.find({"email": user_email})  # Si user_email vient de l'utilisateur

# ✅ BON — Valider et nettoyer les entrées
import re

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError("Email invalide")
    return email

safe_email = validate_email(user_email)
db.users.find({"email": safe_email})
```

---

## 🔒 [ENCRYPTION] Chiffrement des Données

### Données Sensibles en Base de Données

```python
# ✅ TOUJOURS hasher les mots de passe (bcrypt)
from bcrypt import hashpw, gensalt

hashed = hashpw(password.encode(), gensalt(rounds=12))
db.users.insert({"email": email, "password_hash": hashed})
```

### Chiffrement Symétrique End-to-End

```python
# ✅ Chiffrement AES pour données sensibles
from cryptography.fernet import Fernet
import os

# Générer une clé (une seule fois, la stocker sécurisément)
key = Fernet.generate_key()
cipher = Fernet(key)

# Chiffrer
sensitive_data = "Credit card: 4532-XXXX-XXXX-1234"
ciphertext = cipher.encrypt(sensitive_data.encode())

# Déchiffrer
plaintext = cipher.decrypt(ciphertext)
```

### HTTPS Obligatoire

```
✅ Certificats SSL/TLS valides (Let's Encrypt gratuit)
✅ HSTS (HTTP Strict-Transport-Security) activé
✅ Perfect Forward Secrecy (PFS) activé
✅ TLS 1.2 ou 1.3 minimum
✅ Pas de SSL 3.0, TLS 1.0, 1.1
```

### Headers de Sécurité HTTP

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Access-Control-Allow-Origin: https://trusted-domain.com
```

---

## 🧪 [VALIDATION] Validation des Entrées Utilisateur

### Whitelist vs Blacklist

```python
# ❌ MAUVAIS — Blacklist (incomplet et fragile)
if '@' not in email or ' ' not in email:
    raise ValueError("Email invalide")

# ✅ BON — Whitelist (stricte et sûre)
import re

VALID_EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

if not re.match(VALID_EMAIL_PATTERN, email):
    raise ValueError("Email invalide")
```

### Type Hints et Validation TypeScript

```typescript
// ✅ Types stricts + validation
interface UserInput {
  email: string;
  age: number;
  role: 'admin' | 'user' | 'guest';
}

function createUser(input: UserInput): Promise<User> {
  // Validation stricte
  if (!isValidEmail(input.email)) {
    throw new Error('Email invalide');
  }
  if (input.age < 18 || input.age > 150) {
    throw new Error('Âge invalide (18-150)');
  }
  if (!['admin', 'user', 'guest'].includes(input.role)) {
    throw new Error('Rôle invalide');
  }
  
  // Créer l'utilisateur
  return db.users.create(input);
}
```

### Longueur Maximale

```python
# ✅ Limiter les longueurs pour éviter les DoS
MAX_EMAIL_LENGTH = 254  # RFC 5321
MAX_PASSWORD_LENGTH = 128
MAX_USERNAME_LENGTH = 50

def validate_email(email: str) -> str:
    if len(email) > MAX_EMAIL_LENGTH:
        raise ValueError(f"Email trop long (max {MAX_EMAIL_LENGTH})")
    if not re.match(EMAIL_PATTERN, email):
        raise ValueError("Email invalide")
    return email
```

---

## 📡 [TRANSPORT] Sécurité en Transit

### Certificats SSL/TLS

```bash
# Générer avec Let's Encrypt (gratuit)
certbot certonly --standalone -d example.com

# Installer sur serveur
/etc/letsencrypt/live/example.com/
├── cert.pem
├── chain.pem
├── fullchain.pem
└── privkey.pem
```

### Configuration Nginx

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

---

## 🚨 [LOGGING] Logging Sécurisé

### Ne PAS Logger les Secrets

```python
# ❌ MAUVAIS — Log du token!
logger.info(f"Authentication token: {token}")
logger.debug(f"Password hash: {password_hash}")

# ✅ BON — Logs sécurisés
logger.info(f"User {user_id} authenticated successfully")
logger.debug(f"Token issued at {datetime.now()}")
logger.warning(f"Failed login attempt from {ip_address}")
```

### Masquer les Données Sensibles

```python
def log_safely(data: dict) -> dict:
    """Masquer les données sensibles avant logging."""
    safe_data = data.copy()
    
    # Masquer l'email
    if 'email' in safe_data:
        email = safe_data['email']
        safe_data['email'] = email[:3] + '***@***' if len(email) > 3 else '***'
    
    # Masquer le numéro de carte
    if 'card_number' in safe_data:
        card = safe_data['card_number']
        safe_data['card_number'] = card[-4:].rjust(len(card), '*')
    
    # Masquer le mot de passe
    if 'password' in safe_data:
        safe_data['password'] = '***'
    
    return safe_data

logger.info(f"User data: {log_safely(user_data)}")
```

### Levels de Logging

```
ERROR    → Erreurs critiques (authentification échouée)
WARN     → Avertissements (tentatives échouées, configurations suspectes)
INFO     → Actions importantes (login, changement de config, modifications DB)
DEBUG    → Détails techniques (jamais en production!)
```

---

## 🔄 [DEPENDENCY] Gestion des Dépendances

### Vérifier les Vulnérabilités

```bash
# Python
pip install safety
safety check

# JavaScript
npm audit
npm audit fix

# PowerShell
Scan-NetAdapterAdvancedProperty  # (si applicable)
```

### Pinning des Versions

```toml
# pyproject.toml — Pin les versions
[project]
dependencies = [
    "requests>=2.31.0,<2.32",  # Major.Minor lockée
    "qdrant-client>=2.0.0,<3.0",
    "bcrypt>=4.1.0"
]
```

```json
// package-lock.json — Toujours committer!
{
  "dependencies": {
    "express": {
      "version": "4.18.2",  // Pinned
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz"
    }
  }
}
```

---

## 📋 Checklist de Sécurité

- [ ] Pas de secrets en dur ✅
- [ ] `.env` dans `.gitignore` ✅
- [ ] `.env.example` present et à jour ✅
- [ ] HTTPS/TLS activé ✅
- [ ] Mots de passe hashés (bcrypt 12+ rounds) ✅
- [ ] Validation des entrées (whitelist) ✅
- [ ] Pas de SQL/Command/Template injection ✅
- [ ] CORS configuré correctement ✅
- [ ] Logging sans données sensibles ✅
- [ ] Headers de sécurité HTTP présents ✅
- [ ] Dépendances vérifiées pour vulnérabilités ✅
- [ ] Secrets dans services tiers (AWS Secrets, Vault) ✅

---

**⚠️ CRITIQUE** : La sécurité n'est jamais optionnelle. Toute violation = vulnérabilité potentielle.
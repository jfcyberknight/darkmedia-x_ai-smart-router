# 🚀 Frameworks & Libraries - Priorisation Absolue

**Version**: 1.0 | **Philosophie**: Frameworks First, Custom Code Last

---

## 🎯 Principes Fondamentaux

### La Règle d'Or
> **Utiliser un framework existant est TOUJOURS plus rapide et mieux qu'écrire du code custom.**

- ⚡ **40% plus rapide** : Code boilerplate déjà écrit
- 🔧 **80% moins de bugs** : Code éprouvé en production
- 📦 **Maintenance facile** : Updates régulières, communauté active
- 🎓 **Meilleure qualité** : Best practices intégrées
- 🌍 **Écosystème riche** : Plugins, extensions, intégrations

### Quand Coder Custom?

```
SEULEMENT si:
  ├─ Aucun framework n'existe pour ce besoin
  ├─ Les frameworks existants sont trop lourds
  ├─ Performance critique nécessaire (profiling prouvé)
  ├─ Logique métier ultra-spécifique
  └─ R&D/Prototypage initial

DOCUMENTATION OBLIGATOIRE: Justifier pourquoi custom
```

---

## 📚 Frameworks par Domaine

### 🌐 Frontend Web

#### Framework Principal: React + TypeScript + Vite

```javascript
// ✅ BON - React moderne
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function SearchComponent() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetch(`/api/search?q=${query}`).then(r => r.json())
  });
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {isLoading ? 'Loading...' : <Results data={data} />}
    </div>
  );
}
```

#### Alternatives selon le contexte:

| Use Case | Framework | Raison |
|----------|-----------|--------|
| **Full-Stack** | Next.js | API + SSR intégré |
| **Ultra-rapide** | Vite + Vanilla TS | Perf maximale |
| **Réactif simple** | Vue 3 | Syntaxe élégante |
| **Moderne/Esoteric** | SvelteKit | DX exceptionnelle |
| **Micro-frontend** | Qwik | Islands architecture |

#### Libraries Essentielles:

```json
{
  "Routing": "react-router-dom",
  "State Management": "@tanstack/react-query ou Zustand",
  "UI Components": "@headlessui/react ou shadcn/ui",
  "Forms": "react-hook-form",
  "Styling": "TailwindCSS",
  "HTTP Client": "axios ou fetch natif",
  "Testing": "Vitest + Playwright",
  "Build": "Vite"
}
```

❌ **À NE PAS FAIRE**:
- Pas de jQuery
- Pas de XMLHttpRequest custom
- Pas de CSS-in-JS artisanal
- Pas de state management custom

---

### 🐍 Backend Python

#### Framework Principal: FastAPI

```python
# ✅ BON - FastAPI moderne
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None

@app.post("/items/")
async def create_item(item: Item, db: Session = Depends(get_db)):
    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    return db_item

@app.get("/items/{item_id}")
async def read_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404)
    return item
```

#### Alternatives:

| Use Case | Framework | Raison |
|----------|-----------|--------|
| **Microservices rapides** | FastAPI | Async natif |
| **Full-stack monolithe** | Django | Admin inclus |
| **Léger/Flexible** | Flask | Simplicité |
| **Données temps réel** | Starlette | WebSocket |
| **Data science** | Django REST Framework | Sérialization |

#### Libraries Obligatoires:

```python
# Database
sqlalchemy >= 2.0
alembic  # Migrations

# API
fastapi >= 0.100
pydantic >= 2.0
pydantic-settings  # Config

# Async
httpx
aiofiles

# Validation
email-validator
python-multipart

# Testing
pytest >= 7.0
pytest-asyncio
httpx  # Async test client

# Monitoring
prometheus-client
structlog

# Security
python-jose
passlib
bcrypt

# Deployment
uvicorn >= 0.24
gunicorn
```

❌ **À NE PAS FAIRE**:
- Pas de connexion DB raw (utiliser SQLAlchemy)
- Pas de validation custom (utiliser Pydantic)
- Pas de migrations SQL manuelles (utiliser Alembic)
- Pas d'async custom (utiliser FastAPI)

---

### 🟨 Backend Node.js

#### Framework Principal: NestJS (Architecture) ou Express (Simple)

```typescript
// ✅ BON - NestJS avec TypeScript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get(':query')
  async search(@Param('query') query: string) {
    return this.searchService.search(query);
  }

  @Post()
  async create(@Body() createSearchDto: CreateSearchDto) {
    return this.searchService.create(createSearchDto);
  }
}
```

#### Alternatives:

| Use Case | Framework | Raison |
|----------|-----------|--------|
| **Haute architecture** | NestJS | SOLID intégré |
| **API REST simple** | Express | Lightweight |
| **Ultra-rapide** | Fastify | Perf maximale |
| **Full-stack** | Next.js | SSR + API routes |
| **Real-time** | Socket.io + Express | WebSocket |

#### Libraries Essentielles:

```json
{
  "Framework": "express ou nestjs",
  "Database": "prisma ou typeorm",
  "Validation": "joi ou class-validator",
  "HTTP Client": "axios ou node-fetch",
  "Authentication": "passport.js",
  "Logging": "winston ou pino",
  "Testing": "jest",
  "API Documentation": "swagger/openapi",
  "Environment": "dotenv"
}
```

❌ **À NE PAS FAIRE**:
- Pas de callback hell (utiliser async/await)
- Pas de routes en string (utiliser des décorateurs)
- Pas de validation custom (utiliser Joi/class-validator)
- Pas de ORM custom (utiliser Prisma/TypeORM)

---

### 🗄️ Base de Données

#### Choix selon le besoin:

```
┌─ Données Relationnelles
│  └─ PostgreSQL (recommandé) + SQLAlchemy/TypeORM
│
├─ Documents/JSON
│  └─ MongoDB + Mongoose
│
├─ Vecteurs/Embeddings
│  └─ Qdrant + API officielle
│
├─ Cache/Sessions
│  └─ Redis + redis-py/node-redis
│
└─ Time-series
   └─ TimescaleDB (PostgreSQL extension)
```

#### ✅ BON - Utiliser les frameworks:

```python
# Python + SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = create_engine("postgresql://user:pass@localhost/db")
session = Session(engine)

users = session.query(User).filter(User.active == True).all()
```

```javascript
// Node.js + Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  where: { active: true }
});
```

❌ **À NE PAS FAIRE**:
- Pas de requêtes SQL manuelles
- Pas de migrations custom
- Pas de connection pooling custom
- Pas de ORM custom

---

### 🧪 Testing

#### Frameworks par Langage:

| Langage | Framework | Raison |
|---------|-----------|--------|
| **Python** | Pytest | Best-in-class |
| **JavaScript** | Jest | Complet et rapide |
| **TypeScript** | Vitest | Vite-native, rapide |
| **E2E (Web)** | Playwright | Cross-browser moderne |
| **PowerShell** | Pester | Officiel |

#### ✅ BON - Structure de test:

```python
# Python - Pytest
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app('testing')
    return app.test_client()

def test_search(client):
    response = client.get('/api/search?q=test')
    assert response.status_code == 200
    assert 'results' in response.json

def test_search_empty(client):
    response = client.get('/api/search?q=')
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_async_operation():
    result = await some_async_func()
    assert result is not None
```

```javascript
// JavaScript - Jest
describe('SearchAPI', () => {
  it('should search successfully', async () => {
    const response = await fetch('/api/search?q=test');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('results');
  });

  it('should reject empty query', async () => {
    const response = await fetch('/api/search?q=');
    expect(response.status).toBe(400);
  });
});
```

#### Libraries de Support:

```
Mocking:        unittest.mock (Python) / jest.mock (JS)
Assertions:     pytest / expect (Jest)
Coverage:       pytest-cov / istanbul
Performance:    pytest-benchmark / jest --testTimeout
Fixtures:       @pytest.fixture / beforeEach/afterEach
```

---

### 🚀 DevOps/Infrastructure

#### Frameworks et Outils Essentiels:

```yaml
# Infrastructure as Code
Terraform:  IaC pour cloud
Ansible:    Configuration management

# Conteneurs & Orchestration
Docker:     Containerization
Kubernetes: Orchestration (si scaling)

# CI/CD
GitHub Actions:  Pipelines (recommandé)
GitLab CI/CD:    Alternative
Jenkins:         Pour legacy

# Monitoring
Prometheus:  Métriques
Grafana:     Visualisation
ELK Stack:   Logging
```

#### ✅ BON - Utiliser Terraform:

```hcl
# ✅ Infrastructure as Code
resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  tags = { Name = "app-server" }
}

# ❌ À NE PAS FAIRE: Scripts bash custom
```

#### ✅ BON - Docker:

```dockerfile
# ✅ Utiliser les images officielles
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

---

### 🎨 UI Components

#### Libraries Recommandées:

```json
{
  "CSS Framework": "TailwindCSS (recommandé)",
  "Component Library": "shadcn/ui ou HeadlessUI",
  "Form Builder": "React Hook Form",
  "Data Table": "TanStack Table (React Table)",
  "Date Picker": "React DayPicker",
  "Notifications": "Sonner ou React Toastify",
  "Modal/Dialog": "@headlessui/react",
  "Icons": "Lucide React"
}
```

#### ✅ BON - Utiliser des composants:

```tsx
// ✅ TailwindCSS + shadcn/ui
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchForm() {
  return (
    <div className="space-y-4">
      <Input placeholder="Search..." />
      <Button>Search</Button>
    </div>
  );
}

// ❌ À NE PAS FAIRE: CSS custom inutile
```

---

## 📊 Matrice de Décision

```
Besoin: Construire une API REST moderne
├─ Framework? OUI
│  ├─ Python → FastAPI ✅
│  └─ Node.js → Express ou NestJS ✅
├─ Database? OUI
│  ├─ Relationnelle → PostgreSQL + SQLAlchemy/TypeORM ✅
│  └─ Vecteurs → Qdrant + SDK officiel ✅
├─ Testing? OUI
│  ├─ Unit → Pytest/Jest ✅
│  └─ E2E → Playwright ✅
├─ Deployment? OUI
│  ├─ Container → Docker ✅
│  └─ IaC → Terraform ✅
└─ Monitoring? OUI
   ├─ Logs → Structured logging ✅
   └─ Metrics → Prometheus ✅
```

---

## ✅ Checklist Avant de Coder

### Framework Selection
- [ ] Existe-t-il un framework établi pour ce besoin?
- [ ] Est-il activement maintenu (updates régulières)?
- [ ] Communauté active et documentation complète?
- [ ] Compatible avec nos versions de Python/Node?
- [ ] Performance acceptable (benchmarks vérifiés)?

### Implementation
- [ ] Utiliser la version stable la plus récente?
- [ ] Suivre les conventions du framework?
- [ ] Utiliser les plugins officiels plutôt que custom?
- [ ] Configuration au lieu de modification du code?
- [ ] Tests écrits avec le framework de test du domaine?

### Quality
- [ ] Linting/Formatting configuré (ESLint/Ruff)?
- [ ] Tests unitaires > 80% de couverture?
- [ ] Documentation (README, API docs)?
- [ ] Monitoring/Logging en place?
- [ ] Pas de code custom inutile?

---

## 🚫 Anti-Patterns Communs

### ❌ Réinventer la Roue
```python
# MAUVAIS
def my_http_client(url):
    import socket
    # 50 lignes d'implémentation custom

# BON
import requests
response = requests.get(url)
```

### ❌ Ignorer l'Écosystème
```python
# MAUVAIS
def validate_email(email):
    regex = r'^[a-zA-Z0-9._%+-]+@...'
    return re.match(regex, email)

# BON
from pydantic import EmailStr
email: EmailStr = "user@example.com"
```

### ❌ Frameworks Trop Lourd pour le Besoin
```javascript
// MAUVAIS: Next.js pour un simple script
// BON: Node.js + Express

// MAUVAIS: Django pour une simple API CRUD
// BON: FastAPI
```

### ❌ Multiplier les Dépendances
```python
# MAUVAIS: 50 dépendances pour une petite app
# BON: 5-10 dépendances essentielles bien choisies
```

---

## 📈 Performance & Scalabilité

### Ne Pas Sacrifier pour un Framework

Si un framework impacte les performances:

1. **Profiler d'abord** : Prouver le problème
2. **Optimiser le framework** : Avant de changer
3. **Changer si nécessaire** : Vers un plus léger
4. **Documenter** : Justifier la décision

```python
# ✅ FastAPI performance profile
# - Async natif
# - Validation Pydantic optimisée
# - JSON serialization rapide
# - Startup ~100ms

# Si trop lent, alternatives:
# - Starlette (plus bas niveau)
# - Quart (ultra-light async)
```

---

## 🌍 Écosystèmes par Langage

### Python
```
FastAPI/Django → SQLAlchemy → Pytest → Docker → GitHub Actions
    ↓              ↓              ↓         ↓          ↓
  Starlette → Alembic      pytest-cov  docker-compose terraform
    ↓
  Uvicorn
```

### JavaScript/TypeScript
```
React/Next → Prisma/TypeORM → Jest → Docker → GitHub Actions
   ↓            ↓               ↓        ↓         ↓
 Vite      postgres         Playwright  K8s    terraform
   ↓
 Tailwind
```

---

## 📚 Ressources

### Découvrir les Frameworks
- [Awesome Lists](https://awesome.re/)
- [GitHub Trending](https://github.com/trending)
- [PyPI](https://pypi.org/) (Python)
- [NPM](https://www.npmjs.com/) (JavaScript)

### Benchmarking
- [TechEmpower](https://www.techempower.com/benchmarks/) (APIs)
- [10k Benchmark](https://github.com/) (Libs)
- Profilers: py-spy, node --prof, etc.

### Community
- Stack Overflow
- GitHub Discussions
- Subreddits: r/Python, r/typescript, etc.

---

## 🎯 Résumé

### La Phrase d'Or
> **"Si quelqu'un a déjà résolu ce problème, réutilisez sa solution."**

### Hiérarchie
1. Framework reconnu et maintenu
2. Librairie spécialisée et populaire
3. Code custom avec documentation

### Avant de Coder
- Chercher un framework (5 min)
- Évaluer alternatives (10 min)
- Configurer le meilleur (30 min)
- Développer avec (temps économisé × 10)

### Exceptions Documentées
Seules raisons valides pour custom:
- Performance critique (profiling prouvé)
- Besoin très spécifique (aucun framework)
- Constraints extrêmes (offline, embedded, etc.)
- R&D/Prototype avant framework final

---

**🚀 Objectif**: Développer 10× plus rapide en utilisant les outils existants et éprouvés.

**⚡ Mantra**: Framework First, Custom Code Last, Ship Faster.

**✅ Status**: Directive Active | Frameworks Obligatoires | Performance Optimisée
# 🤖 Directives Système — Assistant IA

**Version**: 2.0 | **Scope**: Darkmedia-X — Toutes Sessions

---

## 📌 [IN] Directive Initiale (Auto-Application)

Dès le début de **toute** session ou tâche sur ce projet, l'IA **DOIT** :

1. Explorer le dossier `.instructions-ai/`
2. Lire **TOUS** les fichiers `.md` présents dans ce dossier
3. Appliquer rigoureusement les règles définies dans ces fichiers
4. Mémoriser les directives pour la **durée entière de la session**
5. Ne **jamais** demander à l'utilisateur de rappeler les règles déjà définies

---

## ⚙️ [TOOLS] Priorités Techniques par Langage

| Langage | Outils | Fichier de référence |
|---------|--------|----------------------|
| **Python** | Ruff, pre-commit, Qdrant | `01-python-best-practices.md` |
| **PowerShell** | PSScriptAnalyzer, UTF-8 BOM | `02-powershell-standards.md` |
| **JavaScript/TS** | pnpm, ESLint, Prettier, Jest | `03-javascript-typescript.md` |
| **Git** | Conventional Commits, Git Flow | `04-git-workflow.md` |
| **Sécurité** | .env, SecureString, bcrypt | `05-security-guidelines.md` |
| **Tests/CI** | Pytest, Jest, Pester, GH Actions | `06-testing-ci-cd.md` |
| **Architecture** | SOLID, DI, Clean Architecture | `07-architecture-patterns.md` |
| **UI/UX/CLI** | Palette Darkmedia-X, WCAG | `08-ui-ux-guidelines.md` |
| **Documentation** | README, JSDoc, Docstrings | `09-documentation-standards.md` |

---

## 📝 [RULES] Conventions de Communication

- **Format** : GitHub-style Markdown
- **Langue** : Français (sauf indication contraire de l'utilisateur)
- **Blocs de code** : Toujours avec le chemin de fichier (ex: `path/to/file.ext#L1-10`)
- **Emojis** : Autorisés dans la documentation et le README, **interdits** dans le code source
- **Transparence** : Documenter les changements importants via des artifacts
- **Secrets** : Ne jamais écrire de secrets, clés API ou mots de passe en dur

---

## 📦 [PNPM] Package Manager Obligatoire

> [!CRITICAL]
> **pnpm est LE package manager OBLIGATOIRE pour tous les projets JavaScript/TypeScript.**
> npm et yarn sont INTERDITS. Pas d'exception.

### Pourquoi pnpm?
- ⚡ **3× plus rapide** que npm
- 💾 **Économies disque**: 50% moins d'espace (node_modules deduplication)
- 🔒 **Plus sûr**: Structure non-flat, isolation meilleure
- 📦 **Monorepo natif**: Workspaces intégrés et performants
- 🚀 **Moderne**: Maintenu activement, meilleure DX

### Directive Absolue

```
Tous les projets JS/TS DOIVENT:
├─ Utiliser pnpm (version 8.0+)
├─ Avoir un package.json avec scripts pnpm
├─ Utiliser pnpm install (jamais npm install)
├─ Utiliser pnpm add (jamais npm add)
├─ Utiliser pnpm run (jamais npm run)
└─ Tous les scripts lancés via pnpm
```

### Installation Globale (Une Fois)

```bash
npm install -g pnpm
pnpm --version  # Vérifier (min 8.0)
```

### Scripts Obligatoires dans `package.json`

Tous les projets DOIVENT avoir ces scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:cov": "vitest --coverage",
    "ci": "pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build"
  }
}
```

### Commandes Communes

```bash
pnpm install       # Installer dépendances
pnpm add pkg       # Ajouter dépendance
pnpm add -D pkg    # Ajouter dépendance dev
pnpm dev           # Lancer dev server
pnpm build         # Build pour production
pnpm lint          # Vérifier le code
pnpm format        # Formater le code
pnpm test          # Lancer les tests
pnpm ci            # Pipeline complet (CI/CD)
```

### Checklist pour Chaque Projet

- [ ] pnpm installé globalement (version 8.0+)
- [ ] `package.json` avec section `engines: { pnpm: ">=8.0" }`
- [ ] Tous les scripts définis (dev, build, lint, format, test, ci)
- [ ] `.npmrc` configuré (optionnel mais recommandé)
- [ ] GitHub Actions utilise `pnpm ci`
- [ ] JAMAIS npm ou yarn utilisés
- [ ] `.pnpm-lock.yaml` committé dans Git

### .npmrc (Optionnel mais Recommandé)

```
# Empêcher npm accidental
npm-mode=false

# Strict peer deps
strict-peer-dependencies=false

# Autres options
shamefully-hoist=false
auto-install-peers=true
```

---

## 🚀 [FRAMEWORKS] Priorisation Absolue des Frameworks

> [!CRITICAL]
> **Les frameworks sont TOUJOURS prioritaires sur le code custom**. Leur utilisation doit être préférée par défaut pour aller plus vite et maintenir une meilleure qualité de code.

### Hiérarchie de Priorisation

| Priorité | Approche | Raison |
|----------|----------|--------|
| 1️⃣ **Framework établi** | Utiliser les frameworks majeurs (React, Vue, FastAPI, Django, etc.) | ⚡ Performance, maintenance, écosystème |
| 2️⃣ **Librairie spécialisée** | Préférer les libs reconnues (Pandas, NumPy, Axios, etc.) | 🔧 Éprouvé, documenté, optimisé |
| 3️⃣ **Code custom** | Uniquement si aucun framework/lib existant | 🎯 Cas très spécifiques |

### Frameworks Recommandés par Domaine

#### Frontend Web
- **React** (avec TypeScript, Vite) ✅
- **Vue 3** (avec Vite) ✅
- **Next.js** (full-stack) ✅
- **SvelteKit** ✅
- ❌ Code HTML/CSS/JS vanilla sauf raison valide

#### Backend Python
- **FastAPI** (API REST moderne) ✅
- **Django** (full-stack) ✅
- **Flask** (microservices) ✅
- **SQLAlchemy** (ORM) ✅
- ❌ Requêtes SQL brutes sauf performance critique

#### Backend Node.js
- **Express** (API) ✅
- **NestJS** (architecture) ✅
- **Fastify** (haute performance) ✅
- **Prisma/TypeORM** (ORM) ✅
- ❌ Code Node natif sans framework

#### Base de Données
- **Qdrant** (vecteurs) ✅
- **PostgreSQL** (SQL) ✅
- **MongoDB** (NoSQL) ✅
- **Redis** (cache) ✅
- ❌ Implémentations custom

#### DevOps/Infrastructure
- **Docker** (conteneurs) ✅
- **Kubernetes** (orchestration) ✅
- **Terraform** (IaC) ✅
- **GitHub Actions** (CI/CD) ✅
- ❌ Scripts bash custom

#### Testing
- **Pytest** (Python) ✅
- **Jest** (JavaScript) ✅
- **Playwright** (E2E) ✅
- **Pester** (PowerShell) ✅
- ❌ Tests manuels ou custom

### Règles d'Application

1. **Avant de coder** : Rechercher un framework/lib existant
2. **Jamais réinventer** : Si ça existe, utiliser la version officielle
3. **Latest stable** : Utiliser les versions stables les plus récentes
4. **Configuration > Custom** : Préférer configurer un framework plutôt que modifier son code
5. **Plugins/Extensions** : Utiliser l'écosystème du framework
6. **Performance** : Si un framework est trop lourd, justifier et documenter

### Exemples de Bonne Pratique

❌ **MAUVAIS** - Code custom inutile:
```python
def validate_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None
```

✅ **BON** - Utiliser une librairie:
```python
from pydantic import EmailStr, ValidationError

email: EmailStr = "user@example.com"  # Validation automatique
```

❌ **MAUVAIS** - Framework custom:
```javascript
function makeRequest(url, options) {
    return new Promise((resolve, reject) => {
        // 50 lignes d'implémentation custom fetch
    });
}
```

✅ **BON** - Utiliser Axios ou fetch natif:
```javascript
import axios from 'axios';
const response = await axios.get(url);
```

### Exceptions Justifiées

Les seules raisons valides pour du code custom:
- ⚡ **Performance critique** : Quand le framework ne suffit pas
- 🎯 **Logique métier très spécifique** : Pas de framework applicable
- 📦 **Dépendances minimalistes** : Contexte très contraint
- 🔬 **Prototypage R&D** : Avant de choisir un framework

**Documenter toujours** : Si code custom, expliquer pourquoi aucun framework n'était adapté.

### Checklist Avant de Coder

- [ ] Existe-t-il un framework pour ce besoin?
- [ ] La dernière version est-elle stable?
- [ ] La documentation est-elle claire?
- [ ] L'écosystème est-il actif?
- [ ] Les performances sont-elles acceptables?
- [ ] Si non à 1-5, alors seulement du code custom

---

---

## 🚀 [BEHAVIOR] Comportement de l'IA

### Ce que l'IA doit faire
- ✅ Appliquer les standards sans être relancée
- ✅ Proposer des améliorations proactives
- ✅ Signaler les violations de standards détectées
- ✅ Utiliser Python/MCP pour les calculs lourds et traitements de données massifs
- ✅ Décomposer les tâches complexes par sections (`[1]`, `[2]`, etc.)
- ✅ Valider chaque section avant de passer à la suivante

### Ce que l'IA ne doit pas faire
- ❌ Demander permission pour des actions standard (ShouldAutoProceed: true)
- ❌ Traiter de grands ensembles de données dans son contexte texte
- ❌ Utiliser des alias dans les scripts (ex: `ls`, `cat`, `rm`)
- ❌ Laisser une exception sans gestion d'erreur
- ❌ Coder des secrets en dur

---

## 🔄 [AUTO] Automatisation Récursive

**Les fichiers `.md` dans `.instructions-ai/` définissent des lois système immédiates :**

- Chaque nouveau fichier `.md` ajouté devient une directive active
- Les directives existantes sont persistantes pour toute la session
- En cas de conflit entre directives, le fichier **le plus spécifique** a priorité
- Aucun rappel manuel de l'utilisateur n'est nécessaire

---

## 🗂️ [HIERARCHY] Hiérarchie des Fichiers

```
.instructions-ai/
├── 00-system-directives.md        ← Directives système (ce fichier)
├── 01-python-best-practices.md    ← Python : Ruff, Qdrant, pre-commit
├── 02-powershell-standards.md     ← PowerShell : UTF-8, PSAnalyzer
├── 03-javascript-typescript.md    ← JS/TS : ESLint, Prettier, Jest
├── 04-git-workflow.md             ← Git Flow, Conventional Commits
├── 05-security-guidelines.md      ← Sécurité, secrets, validation
├── 06-testing-ci-cd.md            ← Tests, GitHub Actions, couverture
├── 07-architecture-patterns.md    ← SOLID, patterns, Clean Architecture
├── 08-ui-ux-guidelines.md         ← CLI esthétique, UI Web, accessibilité
└── 09-documentation-standards.md  ← README, JSDoc, Docstrings
```

---

## 📋 [CHECKLIST] Démarrage de Session

- [ ] `.instructions-ai/` exploré ✅
- [ ] Tous les `.md` lus ✅
- [ ] Directives mémorisées ✅
- [ ] Standards actifs pour la session ✅

---

**⚠️ Loi Absolue** : Toute règle définie dans `.instructions-ai/` est appliquée immédiatement et persistamment, sans exception.
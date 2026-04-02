# 📦 pnpm Standards - Package Manager Obligatoire

**Version**: 1.0 | **Status**: CRITICAL | **Mandate**: pnpm ONLY

---

## 🎯 Directive Absolue

> **pnpm est LE seul package manager autorisé pour tous les projets JavaScript/TypeScript.**
>
> npm, yarn, bun sont INTERDITS. Pas d'exception, pas de négociation.

### Pourquoi pnpm?

| Aspect | npm | yarn | pnpm | Verdict |
|--------|-----|------|------|---------|
| **Vitesse** | Lent | Moyen | ⚡ 3× plus rapide | ✅ pnpm |
| **Espace disque** | ~300MB | ~280MB | ⚡ 150MB | ✅ pnpm |
| **Sécurité** | Flat node_modules | Flat node_modules | 🔒 Structure stricte | ✅ pnpm |
| **Monorepo** | ❌ Basique | ✅ Bon | ✅ Excellent | ✅ pnpm |
| **Maintenance** | Ralentissant | Communauté | ✅ Actif | ✅ pnpm |
| **DX (Dev Experience)** | Passable | Bon | ✅ Excellent | ✅ pnpm |

**Résultat**: pnpm est le meilleur choix pour la **performance**, la **sécurité** et la **scalabilité**.

---

## 🚀 Installation & Setup

### Installation Globale (Une seule fois)

```bash
# Installer pnpm globalement
npm install -g pnpm

# Vérifier l'installation
pnpm --version

# Mise à jour (si nécessaire)
pnpm add -g pnpm
```

**Version minimale**: 8.0 ou supérieure

### Configuration Globale (Optionnel)

```bash
# Afficher la config
pnpm config list

# Définir le registre (si nécessaire)
pnpm config set registry https://registry.npmjs.org/

# Définir l'authentification (si nécessaire)
pnpm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
```

---

## 📋 Structure `package.json`

### Minimal Viable

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "Project description",
  "type": "module",
  "engines": {
    "node": ">=18.0",
    "pnpm": ">=8.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "ci": "pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

### Full-Featured (Recommandé)

```json
{
  "name": "@darkmedia-x/project",
  "version": "1.0.0",
  "description": "Darkmedia-X Project",
  "author": "Your Name",
  "license": "MIT",
  "type": "module",
  "engines": {
    "node": ">=18.0",
    "pnpm": ">=8.0"
  },
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "dev": "vite --host",
    "dev:debug": "node --inspect-brk ./node_modules/.bin/vite",
    "build": "tsc && vite build",
    "build:analyze": "vite build --stats",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --watch --noEmit",
    "lint": "eslint src --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "pnpm lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest --run",
    "test:cov": "vitest --coverage",
    "pre-commit": "lint-staged",
    "ci": "pnpm run type-check && pnpm run lint && pnpm run test:run && pnpm run build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "pnpm": {
    "overrides": {
      "some-package": "^1.0.0"
    }
  }
}
```

### Key Fields

| Champ | Obligatoire | Raison |
|-------|-------------|--------|
| `name` | ✅ | Identifiant unique |
| `version` | ✅ | Semver (MAJOR.MINOR.PATCH) |
| `type: "module"` | ✅ | ESM par défaut |
| `engines` | ✅ | Enforcer Node + pnpm |
| `packageManager` | ✅ | Lock la version pnpm |
| `scripts` | ✅ | Commandes de dev/build/test |
| `dependencies` | ✅ | Dépendances production |
| `devDependencies` | ✅ | Dépendances dev uniquement |

---

## 🔧 Commandes Essentielles

### Installation & Dépendances

```bash
# Installer TOUTES les dépendances (package-lock.yaml existant)
pnpm install

# Ajouter une dépendance
pnpm add package-name

# Ajouter une dépendance dev (devDependencies)
pnpm add -D package-name

# Ajouter une dépendance optionnelle
pnpm add -O package-name

# Installer une version spécifique
pnpm add package-name@1.2.3

# Mettre à jour une dépendance
pnpm update package-name

# Supprimer une dépendance
pnpm remove package-name

# Lister les dépendances
pnpm list

# Nettoyer node_modules (rare)
pnpm prune
```

### Scripts & Dev

```bash
# Lancer un script (depuis package.json)
pnpm run dev
pnpm run build
pnpm run test

# Version courte
pnpm dev
pnpm build
pnpm test

# Lancer une commande directement
pnpm exec eslint src
pnpm dlx some-cli-tool  # Télécharger et exécuter temporairement
```

### Monorepo (Workspaces)

```bash
# Lancer un script dans tous les workspaces
pnpm -r run build

# Lancer dans un workspace spécifique
pnpm --filter web run build

# Lister les workspaces
pnpm list --depth=0
```

---

## 📦 .pnpm-lock.yaml

### Qu'est-ce que c'est?

Fichier de lock généré automatiquement par pnpm qui enregistre:
- ✅ Toutes les versions exactes installées
- ✅ Hash de vérification (intégrité)
- ✅ Structure complète des dépendances

### Important

- ✅ **DOIT être committé dans Git** (jamais .gitignore)
- ✅ **Génération automatique** (ne pas éditer manuellement)
- ✅ **Reproduction déterministe** (tout le monde installe les mêmes versions)

```bash
# Voir le lock
cat pnpm-lock.yaml

# Regénérer si besoin (rare)
rm pnpm-lock.yaml
pnpm install
```

---

## .npmrc Configuration

### Minimal

```
# Empêcher npm/yarn accidental
npm-mode=false

# Auto-install peer dependencies
auto-install-peers=true
```

### Complet

```
# ===== SÉCURITÉ =====
strict-peer-dependencies=false
shamefully-hoist=false

# ===== REGISTRE =====
registry=https://registry.npmjs.org/

# ===== PERFORMANCE =====
prefer-frozen-lockfile=true
fetch-timeout=60000

# ===== WORKSPACES =====
recursive-install=true

# ===== DEV =====
enable-pre-post-scripts=true
```

---

## 📊 Scripts Obligatoires

### Tous les projets DOIVENT avoir

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --fix",
    "format": "prettier --write \"src/**/*\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "ci": "pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build"
  }
}
```

### Par Type de Projet

#### Frontend (React/Vue/Svelte)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --fix",
    "format": "prettier --write \"src/**/*\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:cov": "vitest --coverage",
    "ci": "pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build"
  }
}
```

#### Backend (Node API)

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --fix",
    "test": "vitest",
    "test:cov": "vitest --coverage",
    "ci": "pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build"
  }
}
```

#### Monorepo

```json
{
  "scripts": {
    "dev": "pnpm -r run dev",
    "build": "pnpm -r run build",
    "lint": "pnpm -r run lint",
    "test": "pnpm -r run test",
    "ci": "pnpm -r run ci"
  }
}
```

---

## 🚫 Erreurs Courantes & Solutions

### ❌ "pnpm: command not found"

```bash
# Solution: Installer globalement
npm install -g pnpm
```

### ❌ "node-gyp: not found"

```bash
# Solution: Installer dans devDependencies
pnpm add -D node-gyp
```

### ❌ "ERESOLVE unable to resolve dependency tree"

```bash
# Solution: Ignorer et continuer
pnpm install --no-strict-peer-dependencies

# Ou: Résoudre le conflit manuellement
# Éditer package.json ou utiliser pnpm overrides
```

### ❌ "pnpm-lock.yaml is out of sync"

```bash
# Solution: Regénérer le lock
rm pnpm-lock.yaml
pnpm install
```

### ❌ Conflit de dépendances avec monorepo

```bash
# Solution: Utiliser pnpm.overrides dans package.json
{
  "pnpm": {
    "overrides": {
      "some-package": "^1.0.0"
    }
  }
}
```

---

## ✅ Checklist d'Intégration pnpm

### Setup Initial
- [ ] pnpm installé globalement (version 8.0+)
- [ ] `package.json` créé avec `pnpm init`
- [ ] Champ `engines` spécifie pnpm >=8.0
- [ ] Champ `packageManager` définit la version exacte
- [ ] Tous les scripts définis (dev, build, lint, test, ci)

### Dépendances
- [ ] Jamais `npm install` ou `yarn install`
- [ ] Toujours utiliser `pnpm add` et `pnpm install`
- [ ] `pnpm-lock.yaml` committé dans Git
- [ ] `.npmrc` configuré (optionnel mais recommandé)

### Development
- [ ] `pnpm dev` lance le serveur local
- [ ] `pnpm build` crée la build production
- [ ] `pnpm lint` corrige le code
- [ ] `pnpm test` lance les tests
- [ ] `pnpm ci` lance le pipeline complet

### CI/CD
- [ ] GitHub Actions utilise `pnpm ci`
- [ ] Pre-commit hook exécute `pnpm lint:fix && pnpm format`
- [ ] Aucun `npm install` dans les pipelines
- [ ] Cache pnpm configuré dans les workflows

### Documentation
- [ ] README mentionne l'utilisation de pnpm
- [ ] Installation documentée: `pnpm install`
- [ ] Développement documenté: `pnpm dev`
- [ ] Build documenté: `pnpm build`

---

## 🔗 Ressources

- **Docs Officielles**: https://pnpm.io/
- **Installation**: https://pnpm.io/installation
- **CLI Reference**: https://pnpm.io/cli/install
- **Monorepo**: https://pnpm.io/workspaces
- **Configuration**: https://pnpm.io/npmrc

---

## 📝 Résumé

```
RÈGLE ABSOLUE: pnpm est le seul package manager autorisé.

Toujours:
✅ pnpm install
✅ pnpm add package
✅ pnpm run dev
✅ pnpm-lock.yaml committé
✅ Tous les scripts définis

Jamais:
❌ npm install
❌ yarn install
❌ bun install
❌ npm run script
❌ yarn add package
```

---

**Status**: ✅ CRITICAL | 🚀 MANDATORY | 📦 pnpm ONLY

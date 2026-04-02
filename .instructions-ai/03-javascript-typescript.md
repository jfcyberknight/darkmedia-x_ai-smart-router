# 📜 Standards JavaScript/TypeScript

**Version**: 2.1 | **Stack**: pnpm + ESLint + Prettier + TypeScript | **Node**: 18+ | **Package Manager**: pnpm (OBLIGATOIRE)

---

## 🚀 [PNPM] Package Manager Obligatoire

> [!CRITICAL]
> **pnpm est OBLIGATOIRE pour tous les projets JavaScript/TypeScript.** npm et yarn sont interdits.

### Pourquoi pnpm?
- ⚡ **3× plus rapide** que npm
- 💾 **Économies disque**: 50% moins d'espace (disk deduplication)
- 🔒 **Plus sûr**: Pas de flat node_modules
- 📦 **Monorepo natif**: Workspaces intégrés
- 🚀 **Moderne**: Maintenu activement, meilleure DX

### Installation Globale

```bash
# Installation unique
npm install -g pnpm

# Vérifier la version
pnpm --version  # Minimum 8.0

# Mettre à jour
pnpm add -g pnpm
```

### Initialisation d'un Projet

```bash
# Créer un nouveau projet
pnpm init

# Installer les dépendances
pnpm install

# Ajouter une dépendance
pnpm add package-name

# Ajouter une dépendance dev
pnpm add -D dev-package
```

---

## 📋 [SCRIPTS] Scripts pnpm Obligatoires

> [!CRITICAL]
> **Tous les projets DOIVENT avoir un `package.json` avec des scripts pnpm.**
> Les commandes directives (eslint, prettier, etc.) ne doivent JAMAIS être exécutées manuellement.

### Structure Minimale de `package.json`

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "Project description",
  "type": "module",
  "engines": {
    "pnpm": ">=8.0",
    "node": ">=18.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint src --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:cov": "vitest --coverage",
    "pre-commit": "lint-staged",
    "ci": "pnpm run type-check && pnpm run lint && pnpm run test && pnpm run build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### Scripts Essentiels

#### 1. **dev** - Développement local

```bash
pnpm dev
```

**Doit lancer**:
- Vite dev server (HMR activé)
- TypeScript watch mode
- Linting en background (optionnel)

#### 2. **build** - Production build

```bash
pnpm build
```

**Doit**:
- Vérifier les types TypeScript
- Générer bundle optimisé
- Minifier le code
- Générer source maps

#### 3. **lint** - Vérifier le code

```bash
pnpm lint
```

**Ne doit JAMAIS être appelé manuellement** → Utiliser pre-commit hook

#### 4. **lint:fix** - Corriger automatiquement

```bash
pnpm lint:fix
```

**Pour corriger avant commit**

#### 5. **format** - Formater le code

```bash
pnpm format
```

**Ne doit JAMAIS être appelé manuellement** → Utiliser pre-commit hook

#### 6. **type-check** - Vérifier les types TypeScript

```bash
pnpm type-check
```

**Exécuté dans CI/CD et pre-commit**

#### 7. **test** - Lancer les tests

```bash
pnpm test
```

**Doit**:
- Exécuter tous les tests (*.test.ts, *.spec.ts)
- Utiliser Vitest (pas Jest)
- Exit avec code 0 si OK, 1 si erreurs

#### 8. **ci** - Pipeline complet (CI/CD)

```bash
pnpm ci
```

**Exécuté dans GitHub Actions/CI**:
1. Type-check
2. Lint
3. Tests
4. Build

### Exemple Complet

```bash
# Développement
pnpm install    # Une fois
pnpm dev        # Terminal 1
pnpm lint       # Terminal 2 (watch)

# Avant commit
pnpm lint:fix
pnpm format
pnpm type-check

# Production
pnpm build      # Générer dist/
pnpm preview    # Tester la build

# CI/CD
pnpm ci         # Tout d'un coup
```

---

## 🏗️ [SETUP] Configuration Initiale avec pnpm

### Installation des Dépendances

```bash
pnpm init
pnpm add -D eslint prettier typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D eslint-config-airbnb-typescript eslint-plugin-import eslint-plugin-react-hooks
pnpm add -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom
pnpm add -D husky lint-staged
pnpm add -D vite @vitejs/plugin-react
```

### Configuration ESLint (`.eslintrc.json`)

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "airbnb-typescript/base",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": 2024,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "import/prefer-default-export": "off",
    "no-restricted-syntax": "off"
  },
  "env": {
    "browser": true,
    "node": true,
    "es2024": true
  }
}
```

### Configuration Prettier (`.prettierrc.json`)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Configuration TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "ESNext",
    "lib": ["ES2024", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 📝 [LINTING] ESLint et Prettier

### Scripts NPM (`package.json`)

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:cov": "jest --coverage",
    "pre-commit": "lint-staged"
  }
}
```

### Husky Pre-commit Hook

```bash
pnpm add -D husky
pnpm exec husky init
echo "pnpm run lint:fix && pnpm run format && pnpm run type-check" > .husky/pre-commit
```

### `.lintstagedrc.json`

```json
{
  "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "src/**/*.{json,md}": ["prettier --write"]
}
```

---

## 🎨 [CONVENTIONS] Style et Nommage

### Variables et Fonctions (camelCase)

```typescript
// ✅ BON
const userName: string = 'John Doe';
const userCount: number = 42;
const isActive: boolean = true;

function getUserById(userId: number): User {
  // ...
}

const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ MAUVAIS
const user_name = 'John';  // snake_case
const UserName = 'John';   // PascalCase pour variable
function getuser() { }     // minuscule
```

### Classes et Types (PascalCase)

```typescript
// ✅ BON
class UserService {
  // ...
}

interface UserData {
  id: number;
  name: string;
}

type ApiResponse<T> = {
  data: T;
  status: 'success' | 'error';
};

// ❌ MAUVAIS
class userService { }
interface user_data { }
```

### Imports et Exports

```typescript
// ✅ BON — Groupés et ordonnés
import * as fs from 'fs';
import { readFile, writeFile } from 'fs/promises';

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from './services/UserService';
import { LoggerUtil } from './utils/LoggerUtil';

// ✅ Exports explicites
export const getUserById = async (id: number): Promise<User> => {
  // ...
};

export class AnalyticsService {
  // ...
}

export type { UserData, ApiResponse };
```

### Strings : Template Literals

```typescript
// ✅ BON
const name = 'Alice';
const age = 30;
console.log(`Bonjour ${name}, vous avez ${age} ans.`);

// ❌ MAUVAIS
console.log('Bonjour ' + name + ', vous avez ' + age + ' ans.');
```

---

## 📐 [TYPES] TypeScript Best Practices

### Type Annotations (Strict Mode)

```typescript
// ✅ BON — Types explicites partout
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  isActive: boolean;
}

async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data: User = await response.json();
  return data;
}

// ❌ MAUVAIS — Types implicites (any)
async function fetchUser(userId: any): Promise<any> {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  return data;
}
```

### Generics

```typescript
// ✅ BON — Réutilisable et typé
interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  timestamp: Date;
}

async function fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint);
    const data: T = await response.json();
    return { status: 'success', data, timestamp: new Date() };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

// Utilisation
const userResponse = await fetchData<User>('/api/users/1');
const postResponse = await fetchData<Post>('/api/posts/1');
```

### Union et Discriminated Unions

```typescript
// ✅ BON — Type-safe avec discrimination
type Result<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };

function handleResult<T>(result: Result<T>): void {
  if (result.success) {
    console.log(result.data);    // data existe
    // console.log(result.error); // ❌ Type error
  } else {
    console.log(result.error);   // error existe
    // console.log(result.data);  // ❌ Type error
  }
}
```

---

## 🔧 [FUNCTIONS] Fonctions et Async/Await

### Arrow Functions Modernes

```typescript
// ✅ BON
const add = (a: number, b: number): number => a + b;

const fetchUser = async (id: number): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

const users = data.map((item) => ({
  id: item.id,
  name: item.name.toUpperCase(),
}));

// ❌ MAUVAIS — Function declarations
function add(a: number, b: number) {
  return a + b;
}
```

### Async/Await avec Gestion d'Erreurs

```typescript
// ✅ BON — Try/catch structuré
async function processUserData(userId: number): Promise<void> {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchUserPosts(userId);
    
    console.log(`Utilisateur: ${user.name}, Posts: ${posts.length}`);
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Erreur réseau:', error.message);
    } else if (error instanceof Error) {
      console.error('Erreur:', error.message);
    } else {
      console.error('Erreur inattendue:', error);
    }
    throw error; // Re-throw si nécessaire
  }
}

// ✅ BON — Promise.all pour opérations parallèles
const [user, posts, comments] = await Promise.all([
  fetchUser(userId),
  fetchUserPosts(userId),
  fetchUserComments(userId),
]);
```

### Optional Chaining et Nullish Coalescing

```typescript
// ✅ BON — Sûr contre les nulls
const userName = user?.name ?? 'Anonymous';
const email = user?.contact?.email ?? 'no-email@example.com';
const count = user?.posts?.length ?? 0;

// ❌ MAUVAIS — Peut crasher
const userName = user.name;  // Si user est null/undefined
```

---

## 🧪 [TESTING] Tests avec Jest

### Configuration Jest (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Exemples de Tests

```typescript
// src/__tests__/UserService.test.ts
import { UserService } from '../services/UserService';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe('createUser', () => {
    it('should create a valid user', async () => {
      const user = await service.createUser({
        name: 'Alice',
        email: 'alice@test.com',
      });
      
      expect(user).toHaveProperty('id');
      expect(user.name).toBe('Alice');
      expect(user.email).toBe('alice@test.com');
    });

    it('should throw on invalid email', async () => {
      await expect(
        service.createUser({ name: 'Bob', email: 'invalid' })
      ).rejects.toThrow('Invalid email format');
    });

    it('should reject duplicate email', async () => {
      await service.createUser({ name: 'Charlie', email: 'charlie@test.com' });
      
      await expect(
        service.createUser({ name: 'David', email: 'charlie@test.com' })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('getUser', () => {
    it('should return user by ID', async () => {
      const created = await service.createUser({
        name: 'Eve',
        email: 'eve@test.com',
      });
      
      const found = await service.getUser(created.id);
      expect(found).toEqual(created);
    });

    it('should return null for non-existent user', async () => {
      const user = await service.getUser(99999);
      expect(user).toBeNull();
    });
  });
});
```

### Exécution

```bash
pnpm test                    # Tous les tests
pnpm test -- --coverage      # Avec couverture
pnpm test -- --watch         # Mode watch
pnpm test -- --testNamePattern="should create"  # Tests spécifiques
```

---

## 📁 [STRUCTURE] Structure de Projet

```
my_project/
├── src/
│   ├── __tests__/
│   │   ├── services/
│   │   │   └── UserService.test.ts
│   │   └── utils/
│   │       └── helpers.test.ts
│   ├── services/
│   │   ├── UserService.ts
│   │   └── OrderService.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── validators.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── order.ts
│   │   └── api.ts
│   └── index.ts
├── .eslintrc.json
├── .prettierrc.json
├── jest.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## ✅ Checklist de Qualité JS/TS

- [ ] ESLint : 0 erreurs (`npm run lint`)
- [ ] Prettier : format appliqué (`npm run format`)
- [ ] TypeScript : `strict: true` activé
- [ ] Pas de `any` implicite
- [ ] Type hints sur toutes les fonctions publiques
- [ ] Imports organisés
- [ ] Tests : couverture > 80%
- [ ] Pas de `console.log` en production
- [ ] JSDoc sur toutes les fonctions publiques
- [ ] `.eslintignore` et `.prettierignore` à jour

---

**📌 Note** : Ces standards garantissent du code JavaScript/TypeScript maintenable, sûr et performant au sein de Darkmedia-X.
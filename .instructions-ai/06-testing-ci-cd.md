# 🧪 Directives Testing et CI/CD

**Version**: 2.0 | **Standards**: Jest, Pytest, Pester, GitHub Actions

---

## 🧪 [TESTING] Stratégie de Tests

### Pyramide des Tests
```
        △  E2E Tests (5%)
       △△  Integration Tests (15%)
      △△△  Unit Tests (80%)
```

### Couverture de Code Minimale
```
Minimum requis: 80% de couverture globale
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%
```

---

## 🐍 [PYTHON] Tests avec Pytest

### Structure de Projet
```
project/
├── src/
│   ├── __init__.py
│   ├── services.py
│   └── models.py
└── tests/
    ├── __init__.py
    ├── unit/
    │   ├── test_services.py
    │   └── test_models.py
    ├── integration/
    │   └── test_api.py
    └── e2e/
        └── test_workflows.py
```

### Configuration `pyproject.toml`
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
addopts = "--cov=src --cov-report=html --cov-report=xml --cov-fail-under=80 -v"
markers = [
    "unit: Unit tests",
    "integration: Integration tests",
    "e2e: End-to-end tests"
]
```

### Exemple de Tests
```python
# tests/unit/test_user_service.py
import pytest
from src.services import UserService
from src.models import User

@pytest.fixture
def service():
    """Fixture pour initialiser le service."""
    return UserService()

class TestUserService:
    def test_create_user_valid(self, service):
        """Test création d'un utilisateur valide."""
        user = service.create_user("alice@example.com", "Alice")
        assert user.id is not None
        assert user.email == "alice@example.com"
        assert user.name == "Alice"
    
    def test_create_user_invalid_email(self, service):
        """Test création avec email invalide."""
        with pytest.raises(ValueError, match="Invalid email"):
            service.create_user("invalid", "Bob")
    
    def test_get_user_not_found(self, service):
        """Test récupération d'un utilisateur inexistant."""
        user = service.get_user(999)
        assert user is None
    
    @pytest.mark.integration
    def test_user_persistence(self, service):
        """Test persistance en base de données."""
        user = service.create_user("charlie@example.com", "Charlie")
        retrieved = service.get_user(user.id)
        assert retrieved.email == user.email
```

### Exécution
```bash
# Tous les tests
pytest

# Avec couverture
pytest --cov=src --cov-report=html

# Test spécifique
pytest tests/unit/test_user_service.py::TestUserService::test_create_user_valid

# Verbose
pytest -v --tb=short

# Uniquement les tests unitaires
pytest -m unit

# Watch mode (avec pytest-watch)
ptw
```

---

## 📜 [JAVASCRIPT] Tests avec Jest

### Configuration `jest.config.js`
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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Exemple de Tests
```typescript
// src/__tests__/UserService.test.ts
import { UserService } from '../services/UserService';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
npm test                    # Tous les tests
npm test -- --coverage      # Avec couverture
npm test -- --watch         # Mode watch
npm test -- --testNamePattern="should create"
npm test -- --updateSnapshot  # Mettre à jour les snapshots
```

---

## 🔵 [POWERSHELL] Tests avec Pester

### Configuration
```powershell
$config = New-PesterConfiguration
$config.Run.Path = ".\tests"
$config.Output.Verbosity = "Detailed"
$config.CodeCoverage.Enabled = $true
$config.CodeCoverage.Path = ".\src\*.ps1"
$config.CodeCoverage.CoveragePercentTarget = 80
```

### Exemple de Tests
```powershell
# tests/Get-Configuration.Tests.ps1
Describe "Get-Configuration" {
    BeforeAll {
        . ".\src\Get-Configuration.ps1"
    }

    Context "Comportement normal" {
        It "Doit retourner un objet valide" {
            $config = Get-Configuration
            $config | Should -Not -BeNullOrEmpty
            $config | Should -HaveProperty "Path"
            $config | Should -HaveProperty "Version"
        }

        It "Doit supporter un chemin personnalisé" {
            $config = Get-Configuration -Path ".\custom\config.json"
            $config.Path | Should -Be ".\custom\config.json"
        }
    }

    Context "Gestion des erreurs" {
        It "Doit lever une exception si le fichier est absent" {
            { Get-Configuration -Path ".\inexistant.json" } | Should -Throw
        }

        It "Doit afficher un avertissement si le format est invalide" {
            { Get-Configuration -Path ".\invalid.json" } | Should -Throw
        }
    }
}
```

### Exécution
```powershell
# Installation
Install-Module -Name Pester -Force -SkipPublisherCheck

# Tous les tests
Invoke-Pester .\tests\ -Verbose

# Avec couverture de code
Invoke-Pester .\tests\ -CodeCoverage .\src\*.ps1
```

---

## 🔄 [CI/CD] GitHub Actions

### `.github/workflows/ci.yml`
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint with ESLint
        run: npm run lint
      
      - name: Format check with Prettier
        run: npm run format:check
      
      - name: Type check with TypeScript
        run: npm run type-check
      
      - name: Run tests with coverage
        run: npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
      
      - name: Build
        run: npm run build
```

### `.github/workflows/python-tests.yml`
```yaml
name: Python Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.10', '3.11', '3.12']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov ruff
      
      - name: Lint with Ruff
        run: ruff check .
      
      - name: Format check
        run: ruff format . --check
      
      - name: Run tests with coverage
        run: pytest --cov=src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage.xml
```

### `.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
      
      - name: Build Docker image
        run: docker build -t myapp:${{ github.ref_name }} .
      
      - name: Push to Docker Hub
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASSWORD }}
          docker push myapp:${{ github.ref_name }}
      
      - name: Deploy to server
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.DEPLOY_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no user@server << 'EOF'
          cd /app
          docker pull myapp:${{ github.ref_name }}
          docker-compose up -d
          EOF
```

---

## 📊 [COVERAGE] Rapports de Couverture

### Codecov Integration
```yaml
# .codecov.yml
coverage:
  precision: 2
  round: down
  range: "70...100"

ignore:
  - "tests"
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "**/node_modules"
```

### Badge Codecov
```markdown
[![codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg?token=ABC123)](https://codecov.io/gh/username/repo)
```

---

## ✅ Checklist Tests et CI/CD

- [ ] Tests unitaires: >80% couverture ✅
- [ ] Tests d'intégration pour APIs ✅
- [ ] E2E tests pour workflows critiques ✅
- [ ] CI pipeline automatisé ✅
- [ ] Linting automatique avant commit ✅
- [ ] Tests passent avant merge ✅
- [ ] Coverage reports publiés ✅
- [ ] Deployment automatisé pour production ✅
- [ ] Secrets gérés via GitHub Secrets ✅
- [ ] Rollback capability en place ✅

---

**📌 Note**: Pas de code en production sans tests. 80% couverture minimum obligatoire.
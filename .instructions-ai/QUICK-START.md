# ⚡ QUICK START — 5 Minutes pour Commencer

**Objectif**: Configurer un projet en 5 minutes avec les standards Darkmedia-X

---

## 🚀 Étape 1: Identifier Votre Type de Projet (1 min)

Sélectionnez **UNE** option:

- [ ] **Python** (Backend, API, Scripts)
- [ ] **JavaScript/TypeScript** (Frontend, Node.js)
- [ ] **PowerShell** (Automation, Scripts Windows)
- [ ] **Infrastructure** (Docker, Kubernetes, DevOps)
- [ ] **AI/ML** (LLM, Qdrant, ML Models)

---

## 🐍 Si Python

```bash
# 1. Créer venv (30s)
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# 2. Installer tools (1 min)
pip install ruff pre-commit pytest pytest-cov

# 3. Créer 3 fichiers de config (2 min)
# Copier depuis: 01-python-best-practices.md
# - pyproject.toml
# - .pre-commit-config.yaml
# - .env.example

# 4. Initialiser (1 min)
pre-commit install
pytest  # Doit passer

# 5. Vérifier (30s)
ruff check .
```

**Fichiers à lire**:
1. [README.md](README.md)
2. [01-python-best-practices.md](01-python-best-practices.md)
3. [04-git-workflow.md](04-git-workflow.md)
4. [05-security-guidelines.md](05-security-guidelines.md)

---

## 📜 Si JavaScript/TypeScript

```bash
# 1. Initialiser pnpm (30s)
pnpm init
pnpm add -D eslint prettier typescript jest @typescript-eslint/parser

# 2. Créer config files (1 min)
# Copier depuis: 03-javascript-typescript.md
# - .eslintrc.json
# - .prettierrc.json
# - jest.config.js
# - tsconfig.json

# 3. Vérifier (1 min)
pnpm run lint
pnpm run format
pnpm test

# 4. Créer .env.example (1 min)
# Copier depuis: 05-security-guidelines.md
```

**Fichiers à lire**:
1. [README.md](README.md)
2. [03-javascript-typescript.md](03-javascript-typescript.md)
3. [04-git-workflow.md](04-git-workflow.md)
4. [05-security-guidelines.md](05-security-guidelines.md)

---

## 🔵 Si PowerShell

```powershell
# 1. Installer modules (1 min)
Install-Module -Name PSScriptAnalyzer -Force
Install-Module -Name Pester -Force

# 2. Copier .vscode/settings.json (30s)
# Depuis: 02-powershell-standards.md
# S'assurer UTF-8 with BOM

# 3. Créer test file (1 min)
# Créer: tests/MyScript.Tests.ps1

# 4. Vérifier (1 min)
Invoke-ScriptAnalyzer -Path ".\script.ps1"
Invoke-Pester .\tests\

# 5. Encoder UTF-8 BOM (30s)
# File → Save with Encoding → UTF-8 with BOM
```

**Fichiers à lire**:
1. [README.md](README.md)
2. [02-powershell-standards.md](02-powershell-standards.md)
3. [04-git-workflow.md](04-git-workflow.md)
4. [05-security-guidelines.md](05-security-guidelines.md)

---

## 🐳 Si Infrastructure (DevOps)

```bash
# 1. Créer Dockerfile (1 min)
# Copier depuis: 11-devops-infrastructure.md

# 2. Créer docker-compose.yml (1 min)
# Copier depuis: 11-devops-infrastructure.md

# 3. Créer Kubernetes manifests (1 min)
# Créer: kubernetes/deployment.yaml
# Copier depuis: 11-devops-infrastructure.md

# 4. Créer prometheus.yml (1 min)
# Copier depuis: 16-monitoring-observability.md

# 5. Tester (1 min)
docker-compose up -d
docker-compose logs
```

**Fichiers à lire**:
1. [README.md](README.md)
2. [11-devops-infrastructure.md](11-devops-infrastructure.md)
3. [05-security-guidelines.md](05-security-guidelines.md)
4. [16-monitoring-observability.md](16-monitoring-observability.md)
5. [17-disaster-recovery.md](17-disaster-recovery.md)

---

## 🤖 Si AI/ML (LLM, Qdrant)

```bash
# 1. Installer qdrant (1 min)
pip install qdrant-client sentence-transformers

# 2. Copier qdrant_core.py (1 min)
# Depuis: 12-ai-ml-guidelines.md

# 3. Créer .env pour LLM keys (1 min)
# Depuis: 13-token-economy.md

# 4. Copier cost tracker (1 min)
# Depuis: 13-token-economy.md

# 5. Tester (1 min)
python -c "from qdrant_client import QdrantClient; print('OK')"
```

**Fichiers à lire**:
1. [README.md](README.md)
2. [12-ai-ml-guidelines.md](12-ai-ml-guidelines.md)
3. [13-token-economy.md](13-token-economy.md)
4. [05-security-guidelines.md](05-security-guidelines.md)

---

## 📋 Post-Setup (Après les 5 Minutes)

### Créer la PR de Setup

```bash
git checkout -b feat/setup-darkmedia-standards
git add .
git commit -m "feat: setup Darkmedia-X standards and linting"
git push origin feat/setup-darkmedia-standards
# Ouvrir PR sur GitHub
```

### Lire les Directives Complètes

Selon ton type de projet, lire progressivement:

1. **Cette semaine**: Directives CRITIQUE + IMPORTANT
2. **Semaine prochaine**: Directives BONNE PRATIQUE
3. **Au besoin**: Directives spécialisées

### Mesurer le Succès

```bash
# Chaque commit doit passer
ruff check .
pytest
npm run lint  # ou équivalent

# Zéro erreurs = prêt à merger
```

---

## ✅ Checklist 5 Minutes

- [ ] Sélectionné mon type de projet
- [ ] Copié les config files
- [ ] Installé les tools
- [ ] Testé localement (tout passe)
- [ ] Créé une PR de setup
- [ ] Lire README.md après
- [ ] Lire les 3-5 directives correspondantes

---

## 🆘 Problèmes Courants

### "Erreur lors de ruff check"
→ Vérifier `pyproject.toml` a été copié correctement
→ Lire [01-python-best-practices.md](01-python-best-practices.md)

### "ESLint ne marche pas"
→ Vérifier `.eslintrc.json` existe
→ Faire `npm install` à nouveau
→ Lire [03-javascript-typescript.md](03-javascript-typescript.md)

### "Pester tests échouent"
→ Vérifier encodage UTF-8 with BOM
→ Lire [02-powershell-standards.md](02-powershell-standards.md)

### "Docker build échoue"
→ Vérifier Dockerfile copié correctement
→ Lire [11-devops-infrastructure.md](11-devops-infrastructure.md)

---

## 📚 Prochaines Lectures (Ordre Recommandé)

1. **Immédiat** → [README.md](README.md) (15 min)
2. **Aujourd'hui** → Directives pour ton langage (1h)
3. **Cette semaine** → Directives pour ton domaine (2-3h)
4. **Ce mois** → Cas d'études [20-case-studies.md](20-case-studies.md) (1h)
5. **Au besoin** → Autres directives spécialisées

---

## 🎯 Prochains Pas

```
Jour 1:   Setup complet ✅
Jour 2-3: Code review des configs
Jour 4-5: Premiers commits avec linting
Semaine 2: Intégrer testing
Semaine 3: Intégrer monitoring
```

---

## 💡 Pro Tips

1. **Sauvegardez les configs en template**
   - Créer un repo "project-template"
   - Réutiliser pour futurs projets
   
2. **Automatisez tout**
   - Pre-commit hooks = zéro effort
   - CI/CD = tests obligatoires
   
3. **Mesurez constamment**
   - Coverage > 80%
   - Linting errors = 0
   - Coûts tokens en baisse
   
4. **Documentez les décisions**
   - Pourquoi cette config?
   - Quelles exceptions à la règle?

---

## 🎁 Bonus: Économies Rapides

Implémenter juste **3 directives** = **$50K+ économies/an**:

1. **13-token-economy.md** → Réduire coûts LLM 50%
2. **06-testing-ci-cd.md** → Moins de bugs en prod
3. **16-monitoring-observability.md** → Détecter problèmes plus tôt

---

**Vous êtes prêts! Allez coder! 🚀**

Pour plus de détails → Lire [README.md](README.md)
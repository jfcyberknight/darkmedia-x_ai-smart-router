# 🌳 Git Workflow et Conventions de Commits

**Version**: 2.0 | **Standard**: Conventional Commits + Git Flow

---

## 📋 [COMMITS] Conventions de Commits

### Format Conventional Commits
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types de Commits
```
feat:      Nouvelle fonctionnalité
fix:       Correction de bug
docs:      Modifications documentation
style:     Changements formatage (pas de logique)
refactor:  Refactoring code (pas feat/fix)
perf:      Amélioration performance
test:      Ajout/modification tests
ci:        Configuration CI/CD
build:     Changements build/dépendances
chore:     Autres changements
```

### Exemples
```bash
# ✅ BON
git commit -m "feat(auth): add OAuth2 authentication"
git commit -m "fix(api): handle null pointer exception"
git commit -m "docs: update README installation steps"
git commit -m "refactor(core): simplify user service logic"
git commit -m "test(qdrant): add integration tests"

# ❌ MAUVAIS
git commit -m "update"
git commit -m "fix bug"
git commit -m "WIP"
```

### Commit Détaillé
```
feat(database): add Qdrant integration layer

- Implement QdrantMemory class for vector storage
- Add automatic collection creation on initialization
- Support for semantic search with similarity scoring

This enables centralized memory management across all AI projects
and provides a reusable interface for vector operations.

Closes #123
Related-to: #125
```

---

## 🔀 [FLOW] Git Flow Workflow

### Branches Principales
```
main          → Production (tags de version)
develop       → Staging/Integration
feature/*     → Nouvelles fonctionnalités
bugfix/*      → Corrections non-urgentes
hotfix/*      → Corrections urgentes (basé sur main)
release/*     → Préparation de release
```

### Processus Feature
```bash
# 1. Mise à jour
git checkout develop
git pull origin develop

# 2. Créer branche
git checkout -b feature/my-feature

# 3. Commits réguliers
git commit -m "feat: implement feature"
git commit -m "test: add tests"

# 4. Push et PR
git push origin feature/my-feature
# Ouvrir PR vers develop

# 5. Merge après approval
```

### Hotfix (Production)
```bash
# Basé sur main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Commits et push
git push origin hotfix/critical-bug
# Créer 2 PRs : main ET develop
```

---

## ✅ [PR] Pull Requests

### Template de PR
```markdown
## Description
Explication brève du changement et de son impact.

## Type de changement
- [ ] Nouvelle feature
- [ ] Correction de bug
- [ ] Documentation
- [ ] Refactoring

## Checklist
- [ ] Code formaté (Prettier/Ruff)
- [ ] Linting: 0 erreurs
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] Pas de secrets en dur

## Tests effectués
Description des tests:
- [ ] Test fonctionnel X
- [ ] Test d'intégration Y
```

---

## 🏷️ [TAGS] Versioning Sémantique

### Format MAJOR.MINOR.PATCH
```
v1.0.0        Production première version
v1.1.0        Nouvelle feature
v1.1.1        Bugfix
v2.0.0        Breaking changes
v1.0.0-rc.1   Release candidate
```

### Créer un Tag
```bash
# Annoté (recommandé)
git tag -a v1.0.0 -m "Version 1.0.0 - Production"

# Push tags
git push origin v1.0.0
```

---

## 📊 [HISTORY] Historique Propre

### Rebase vs Merge
```bash
# ✅ Rebase (historique linéaire)
git rebase develop

# ✅ Merge avec contexte
git merge --no-ff feature/my-feature -m "Merge feature/my-feature"
```

### Squash Commits
```bash
# Combiner plusieurs commits avant PR
git rebase -i develop

# Marquer les commits à combiner avec 's' (squash)
# Écrire un message cohérent
```

### Nettoyer les Branches
```bash
# Supprimer locale
git branch -d feature/old-feature

# Supprimer distante
git push origin --delete feature/old-feature

# Lister branches fusionnées
git branch -a --merged
```

---

## 🔐 [PROTECTION] Branch Protection Rules

### main (Production)
```
✅ Require pull request reviews (2 reviewers)
✅ Require status checks to pass
  ├─ ESLint passing
  ├─ Tests passing
  ├─ Build successful
✅ Require branches to be up to date
✅ Require code reviews from code owners
✅ Dismiss stale pull request approvals
✅ Require conversation resolution
```

### develop (Staging)
```
✅ Require pull request reviews (1 reviewer)
✅ Require status checks to pass
✅ Require branches to be up to date
```

---

## 📱 [WORKFLOW] Workflow Complet d'une Feature

```bash
# 1. Mise à jour locale
git checkout develop
git pull origin develop

# 2. Créer branche feature
git checkout -b feature/my-awesome-feature

# 3. Développement (commits réguliers)
git commit -m "feat: add user authentication"
git commit -m "test: add auth tests"
git commit -m "docs: update auth documentation"

# 4. Rebase avant PR (optionnel)
git fetch origin develop
git rebase origin/develop

# 5. Force push si rebasé
git push origin feature/my-awesome-feature -f

# 6. Créer PR sur GitHub
# Titre: feat: add user authentication
# Description: Explication détaillée

# 7. Attendre reviews et corrections

# 8. Une fois approuvé, merge dans develop
git checkout develop
git pull origin develop
git merge --no-ff feature/my-awesome-feature
git push origin develop

# 9. Supprimer la branche
git branch -d feature/my-awesome-feature
git push origin --delete feature/my-awesome-feature
```

---

## 💡 [TIPS] Bonnes Pratiques

### Commits Atomiques
```
❌ MAUVAIS : 1 commit avec 10 fichiers modifiés, 5 features et 3 bugfixes
✅ BON     : 3 commits séparés (1 par feature/fix)
```

### Messages Clairs
```
❌ "fixed stuff"
✅ "fix(api): handle null pointer in user validation"

❌ "WIP"
✅ "feat(auth): implement OAuth2 flow"
```

### Fréquence
```
✅ Commit après chaque étape logique
✅ 1-5 commits par feature
❌ Pas de commits vides
❌ Pas de commits géants
```

### Avant de Push
```bash
# Vérifier les changements
git status
git diff

# Vérifier l'historique
git log --oneline -5

# Pousser
git push origin feature/ma-feature
```

---

## ✅ Checklist de Commits

- [ ] Message suit Conventional Commits ✅
- [ ] Scope pertinent (auth, api, db, etc.) ✅
- [ ] Description claire et concise ✅
- [ ] Pas de mots de passe ou secrets ✅
- [ ] Code formaté et linté ✅
- [ ] Tests passent localement ✅
- [ ] Commit atomique (une responsabilité) ✅

---

**📌 Note**: Des commits clairs facilitent les reviews et le debugging.
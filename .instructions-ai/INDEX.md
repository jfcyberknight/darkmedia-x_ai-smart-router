# 📑 INDEX — Navigation Rapide du Système

**Version**: 2.2 | **23 Fichiers** | **Navigation Optimisée** | **Frameworks First** ✅ | **pnpm Mandatory** ✅

---

## 🚀 Commencer Ici

1. **Nouveau sur le système?** → Lire [README.md](README.md)
2. **Besoin d'une directive spécifique?** → Chercher ci-dessous
3. **Pas sûr du chemin?** → Voir les parcours par type de projet

---

## 📖 Tous les Fichiers

### 🎯 Fondamentaux (3 fichiers)

| # | Fichier | Sujet | Temps | Priorité |
|---|---------|-------|-------|----------|
| **00** | [system-directives.md](00-system-directives.md) | Directives système & hiérarchie | 30 min | 🔴 CRITIQUE |
| **01** | [python-best-practices.md](01-python-best-practices.md) | Python, Ruff, pre-commit | 1h | 🟠 Selon langue |
| **02** | [powershell-standards.md](02-powershell-standards.md) | PowerShell, UTF-8 BOM | 1h | 🟠 Selon langue |
| **03** | [javascript-typescript.md](03-javascript-typescript.md) | JS/TS, ESLint, Prettier, pnpm | 1.5h | 🟠 Selon langue |
| **21** | [frameworks-priority.md](21-frameworks-priority.md) | Frameworks First, Custom Last | 1.5h | 🔴 CRITIQUE |
| **22** | [pnpm-standards.md](22-pnpm-standards.md) | pnpm Obligatoire, Scripts | 1h | 🔴 CRITIQUE |

---

### 🛠️ Configuration & Qualité (6 fichiers)

| # | Fichier | Sujet | Temps | Priorité |
|---|---------|-------|-------|----------|
| **04** | [git-workflow.md](04-git-workflow.md) | Git Flow, commits conventionnels | 30 min | 🟠 Important |
| **05** | [security-guidelines.md](05-security-guidelines.md) | Secrets, auth, injection | 1h | 🔴 CRITIQUE |
| **06** | [testing-ci-cd.md](06-testing-ci-cd.md) | Tests (Pytest, Jest, Pester) | 1.5h | 🟠 Important |
| **09** | [documentation-standards.md](09-documentation-standards.md) | README, JSDoc, Docstrings | 1h | 🟡 Bonne pratique |
| **21** | [frameworks-priority.md](21-frameworks-priority.md) | Frameworks First, Custom Last | 1.5h | 🔴 CRITIQUE |
| **22** | [pnpm-standards.md](22-pnpm-standards.md) | pnpm Obligatoire | 1h | 🔴 CRITIQUE |

---

### 🏗️ Architecture & APIs (3 fichiers)

| # | Fichier | Sujet | Temps | Priorité |
|---|---------|-------|-------|----------|
| **07** | [architecture-patterns.md](07-architecture-patterns.md) | SOLID, patterns, Clean Code | 1.5h | 🟡 Bonne pratique |
| **08** | [ui-ux-guidelines.md](08-ui-ux-guidelines.md) | Palette, CLI, WCAG | 1h | 🟡 Bonne pratique |
| **15** | [api-standards.md](15-api-standards.md) | REST, GraphQL, versioning | 1h | 🟠 Important |

---

### 💾 Infrastructure & Data (3 fichiers)

| # | Fichier | Sujet | Temps | Priorité |
|---|---------|-------|-------|----------|
| **10** | [database-standards.md](10-database-standards.md) | PostgreSQL, ORM, migrations | 1.5h | 🟠 Important |
| **11** | [devops-infrastructure.md](11-devops-infrastructure.md) | Docker, K8s, Terraform | 2h | 🟠 Important |
| **12** | [ai-ml-guidelines.md](12-ai-ml-guidelines.md) | Qdrant, RAG, embeddings | 1.5h | 🟡 Si applicable |

---

### 💰 Optimisation & Coûts (3 fichiers)

| # | Fichier | Sujet | Temps | Priorité |
|---|---------|-------|-------|----------|
| **13** | [token-economy.md](13-token-economy.md) | Économie tokens LLM | 1.5h | 🟠 Si LLM |
| **16** | [monitoring-observability.md](16-monitoring-observability.md) | Prometheus, Grafana, SLO | 1.5h | 🟠 Important |
| **20** | [case-studies.md](20-case-studies.md) | 5 projets réels + ROI | 1h | 🟡 Inspiration |

---

### 🆘 Risques & Sécurité (3 fichiers)

| # | Fichier | Sujet | Temps | Priorité |
|---|---------|-------|-------|----------|
| **14** | [error-handling.md](14-error-handling.md) | Exceptions, retry, logging | 1.5h | 🟠 Important |
| **17** | [disaster-recovery.md](17-disaster-recovery.md) | Backup, failover, RTO/RPO | 2h | 🟠 Important |
| **18** | [compliance-regulations.md](18-compliance-regulations.md) | GDPR, SOC2, HIPAA | 2h | 🔴 Si données perso |

---

### 👥 Équipe & Collaboration (1 fichier)

| # | Fichier | Sujet | Temps | Priorité |
|---|---------|-------|-------|----------|
| **19** | [team-collaboration.md](19-team-collaboration.md) | Code review, pair, onboarding | 1.5h | 🟡 Bonne pratique |

---

## 🎯 Parcours par Type de Projet

### 🐍 Projet Python (Backend/API)

**Lecture obligatoire** (3.5h):
1. [00-system-directives.md](00-system-directives.md) (30 min)
2. [21-frameworks-priority.md](21-frameworks-priority.md) (30 min) ⭐ **Frameworks First**
3. [01-python-best-practices.md](01-python-best-practices.md) (1h)
4. [04-git-workflow.md](04-git-workflow.md) (30 min)
5. [05-security-guidelines.md](05-security-guidelines.md) (30 min)
6. [10-database-standards.md](10-database-standards.md) (30 min)

**Optionnel si JS/TS interop**:
- [22-pnpm-standards.md](22-pnpm-standards.md) (si appels Node.js)

**Lecture recommandée** (progressive):
- [06-testing-ci-cd.md](06-testing-ci-cd.md)
- [15-api-standards.md](15-api-standards.md)
- [13-token-economy.md](13-token-economy.md) (si LLM)
- [16-monitoring-observability.md](16-monitoring-observability.md)

---

### 📜 Projet JavaScript/React (Frontend)

**Lecture obligatoire** (4.5h):
1. [00-system-directives.md](00-system-directives.md) (30 min)
2. [22-pnpm-standards.md](22-pnpm-standards.md) (1h) ⭐ **pnpm OBLIGATOIRE**
3. [21-frameworks-priority.md](21-frameworks-priority.md) (30 min) ⭐ **Frameworks First**
4. [03-javascript-typescript.md](03-javascript-typescript.md) (1h)
5. [04-git-workflow.md](04-git-workflow.md) (30 min)
6. [05-security-guidelines.md](05-security-guidelines.md) (30 min)
7. [08-ui-ux-guidelines.md](08-ui-ux-guidelines.md) (30 min)

**Lecture recommandée** (progressive):
- [06-testing-ci-cd.md](06-testing-ci-cd.md)
- [15-api-standards.md](15-api-standards.md)
- [09-documentation-standards.md](09-documentation-standards.md)

---

### 🔵 Projet PowerShell (Scripts/Automation)

**Lecture obligatoire** (3h):
1. [00-system-directives.md](00-system-directives.md) (30 min)
2. [21-frameworks-priority.md](21-frameworks-priority.md) (30 min) ⭐ **Frameworks First**
3. [02-powershell-standards.md](02-powershell-standards.md) (1h)
4. [04-git-workflow.md](04-git-workflow.md) (30 min)
5. [05-security-guidelines.md](05-security-guidelines.md) (30 min)

**Si scripts Node.js**:
- [22-pnpm-standards.md](22-pnpm-standards.md) (1h)

**Lecture recommandée** (progressive):
- [06-testing-ci-cd.md](06-testing-ci-cd.md)
- [14-error-handling.md](14-error-handling.md)

---

### 🐳 Projet Infrastructure (DevOps)

**Lecture obligatoire** (4.5h):
1. [00-system-directives.md](00-system-directives.md) (30 min)
2. [21-frameworks-priority.md](21-frameworks-priority.md) (30 min) ⭐ **Frameworks First**
3. [11-devops-infrastructure.md](11-devops-infrastructure.md) (1.5h)
4. [05-security-guidelines.md](05-security-guidelines.md) (30 min)
5. [17-disaster-recovery.md](17-disaster-recovery.md) (1h)
6. [16-monitoring-observability.md](16-monitoring-observability.md) (30 min)

**Lecture recommandée** (progressive):
- [18-compliance-regulations.md](18-compliance-regulations.md)
- [20-case-studies.md](20-case-studies.md) (case 4)

---

### 🤖 Projet AI/ML (LLM/Qdrant)

**Lecture obligatoire** (4h):
1. [00-system-directives.md](00-system-directives.md) (30 min)
2. [21-frameworks-priority.md](21-frameworks-priority.md) (30 min) ⭐ **Frameworks First**
3. [12-ai-ml-guidelines.md](12-ai-ml-guidelines.md) (1h)
4. [13-token-economy.md](13-token-economy.md) (1h)
5. [05-security-guidelines.md](05-security-guidelines.md) (30 min)

**Lecture recommandée** (progressive):
- [10-database-standards.md](10-database-standards.md) (Qdrant specifics)
- [16-monitoring-observability.md](16-monitoring-observability.md)
- [20-case-studies.md](20-case-studies.md) (case 1, 3, 5)

---

## 🔍 Chercher par Sujet

### Langages
- Python → [01-python-best-practices.md](01-python-best-practices.md)
- PowerShell → [02-powershell-standards.md](02-powershell-standards.md)
- JavaScript/TypeScript → [03-javascript-typescript.md](03-javascript-typescript.md)

### Package Manager & Build
- pnpm Standards → [22-pnpm-standards.md](22-pnpm-standards.md) ⭐ **OBLIGATOIRE**
- Scripts pnpm → [22-pnpm-standards.md](22-pnpm-standards.md#scripts-essentiels)
- package.json Structure → [22-pnpm-standards.md](22-pnpm-standards.md#structure-packagejson)

### Frameworks & Librairies
- Priorisation Frameworks → [21-frameworks-priority.md](21-frameworks-priority.md)
- React/Vue/Next.js → [21-frameworks-priority.md](21-frameworks-priority.md#frontend-web)
- FastAPI/Django/Express → [21-frameworks-priority.md](21-frameworks-priority.md#backend-python)
- Testing Frameworks → [21-frameworks-priority.md](21-frameworks-priority.md#testing)

### Sécurité & Compliance
- Secrets & Auth → [05-security-guidelines.md](05-security-guidelines.md)
- GDPR & Conformité → [18-compliance-regulations.md](18-compliance-regulations.md)
- Error Handling → [14-error-handling.md](14-error-handling.md)
- Disaster Recovery → [17-disaster-recovery.md](17-disaster-recovery.md)

### Infrastructure
- Docker & Kubernetes → [11-devops-infrastructure.md](11-devops-infrastructure.md)
- Bases de données → [10-database-standards.md](10-database-standards.md)
- Monitoring → [16-monitoring-observability.md](16-monitoring-observability.md)

### Development
- Git & Commits → [04-git-workflow.md](04-git-workflow.md)
- Testing & CI/CD → [06-testing-ci-cd.md](06-testing-ci-cd.md)
- Architecture → [07-architecture-patterns.md](07-architecture-patterns.md)
- APIs → [15-api-standards.md](15-api-standards.md)

### Équipe
- Code Review → [19-team-collaboration.md](19-team-collaboration.md)
- Documentation → [09-documentation-standards.md](09-documentation-standards.md)
- UI/UX → [08-ui-ux-guidelines.md](08-ui-ux-guidelines.md)

### Optimisation
- Coûts Tokens LLM → [13-token-economy.md](13-token-economy.md)
- Cas d'Études → [20-case-studies.md](20-case-studies.md)

---

## ⏱️ Chemins Optimisés par Temps

### ⏰ Lire en 1h (Essentials)

1. [00-system-directives.md](00-system-directives.md) (30 min)
2. Choisi selon langage (30 min):
   - [01-python-best-practices.md](01-python-best-practices.md) OU
   - [02-powershell-standards.md](02-powershell-standards.md) OU
   - [03-javascript-typescript.md](03-javascript-typescript.md)

---

### ⏰ Lire en 4h (Complet)

1. Chemin essentials (1h)
2. [04-git-workflow.md](04-git-workflow.md) (30 min)
3. [05-security-guidelines.md](05-security-guidelines.md) (30 min)
4. [10-database-standards.md](10-database-standards.md) OU [11-devops-infrastructure.md](11-devops-infrastructure.md) (1h)
5. [06-testing-ci-cd.md](06-testing-ci-cd.md) (45 min)

---

### ⏰ Lire en 8h (Mastery)

Tous les fichiers marqués 🔴 ou 🟠 dans le tableau ci-dessus.

---

## 🎯 Chercher par Problème

### "Je dois réduire mes coûts LLM"
→ [13-token-economy.md](13-token-economy.md)
→ [20-case-studies.md](20-case-studies.md) (case 3)

### "Je dois sécuriser mon application"
→ [05-security-guidelines.md](05-security-guidelines.md)
→ [18-compliance-regulations.md](18-compliance-regulations.md) (si données perso)

### "Je dois tester mon code"
→ [06-testing-ci-cd.md](06-testing-ci-cd.md)

### "Je dois déployer en production"
→ [11-devops-infrastructure.md](11-devops-infrastructure.md)
→ [17-disaster-recovery.md](17-disaster-recovery.md)
→ [16-monitoring-observability.md](16-monitoring-observability.md)

### "Je dois améliorer ma code review"
→ [19-team-collaboration.md](19-team-collaboration.md)

### "Je dois créer une API"
→ [15-api-standards.md](15-api-standards.md)

### "Je dois utiliser Qdrant/LLM"
→ [12-ai-ml-guidelines.md](12-ai-ml-guidelines.md)
→ [13-token-economy.md](13-token-economy.md)

### "Je dois comprendre l'impact ROI"
→ [20-case-studies.md](20-case-studies.md)

---

## 📊 Matrice de Priorités

```
CRITIQUE (Jour 1):
├─ 00-system-directives.md
├─ 22-pnpm-standards.md ⭐ pnpm OBLIGATOIRE (si JS/TS)
├─ 21-frameworks-priority.md ⭐ Frameworks First
├─ 05-security-guidelines.md
└─ Langage correspondant (01/02/03)

IMPORTANT (Semaine 1):
├─ 04-git-workflow.md
├─ 06-testing-ci-cd.md
├─ 10-database-standards.md (si DB)
├─ 11-devops-infrastructure.md (si infra)
└─ 15-api-standards.md (si API)

BONNE PRATIQUE (Semaine 2-4):
├─ 07-architecture-patterns.md
├─ 08-ui-ux-guidelines.md
├─ 09-documentation-standards.md
├─ 14-error-handling.md
├─ 16-monitoring-observability.md
├─ 17-disaster-recovery.md
└─ 19-team-collaboration.md

SI APPLICABLE:
├─ 12-ai-ml-guidelines.md (si LLM)
├─ 13-token-economy.md (si LLM)
└─ 18-compliance-regulations.md (si données perso)

INSPIRATION:
└─ 20-case-studies.md (toujours utile)
```

---

## ✅ Checklist Complète

- [ ] Lire README.md
- [ ] Lire 00-system-directives.md
- [ ] Lire directives pour mon langage
- [ ] Lire directives pour mon domaine
- [ ] Copier les config files
- [ ] Tester localement (tous les outils passent)
- [ ] Créer une PR de setup
- [ ] Relire avant de coder

---

## 🆘 Aide Rapide

**Je cherche comment...?**

→ Chercher le sujet dans "Chercher par Sujet" ci-dessus
→ Ou chercher dans "Chercher par Problème"

**Quel fichier lire d'abord?**

→ [README.md](README.md), puis le chemin correspondant à ton projet

**Combien de temps ça prend?**

→ Voir "Chemins Optimisés par Temps"

**Je suis bloqué**

→ Chercher dans le fichier correspondant
→ Voir les case studies [20-case-studies.md](20-case-studies.md)
→ Ouvrir une issue

---

## 🔗 Liens Rapides

- [README.md](README.md) — Guide complet d'utilisation
- [22-pnpm-standards.md](22-pnpm-standards.md) — pnpm OBLIGATOIRE ⭐
- [21-frameworks-priority.md](21-frameworks-priority.md) — Frameworks First, Custom Last ⭐
- [20-case-studies.md](20-case-studies.md) — Exemples réels + ROI ($5M+)
- [13-token-economy.md](13-token-economy.md) — Économiser sur les tokens LLM
- [00-system-directives.md](00-system-directives.md) — Directives fondamentales

---

**23 Fichiers | pnpm Mandatory | Frameworks First | 5M+ Économies | Production-Ready**
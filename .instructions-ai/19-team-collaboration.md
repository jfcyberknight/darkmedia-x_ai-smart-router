# 👥 Collaboration d'Équipe et Workflow

**Version**: 2.0 | **Focus**: Code Review, Pair Programming, Onboarding

---

## 🎯 [OVERVIEW] Principes de Collaboration

### Valeurs Darkmedia-X
- ✅ **Transparence** : Partager le savoir ouvertement
- ✅ **Asynchrone** : Respecter les fuseaux horaires
- ✅ **Documentation** : Tout doit être documenté
- ✅ **Inclusion** : Tous les avis comptent
- ✅ **Qualité** : Pas de compromis sur les standards

---

## 🔍 [CODE-REVIEW] Processus de Code Review

### Avant de Soumettre une PR

```markdown
## Checklist Pre-Submit

- [ ] Branch à jour avec `main` (rebase)
- [ ] Tests passent localement (100%)
- [ ] Linting: 0 erreurs (ESLint/Ruff)
- [ ] Format appliqué (Prettier/Black)
- [ ] Pas de console.log/print en production
- [ ] Pas de secrets en dur
- [ ] Documentation/comments ajoutés
- [ ] CHANGELOG mis à jour
- [ ] Performance vérifiée (si applicable)
```

### Template de PR Optimal

```markdown
## 📝 Description
Brève explication du changement (2-3 lignes max).

### 🎯 Type de Changement
- [ ] Nouvelle feature
- [ ] Correction de bug
- [ ] Refactoring
- [ ] Documentation

### 🧪 Testing
- [ ] Tests unitaires ajoutés
- [ ] Tests d'intégration ajoutés
- [ ] Tous les tests passent

### 📊 Impact
- Performance: [constant / amélioration / dégradation]
- Breaking changes: [oui / non]
- Migration requise: [oui / non]

### 🔗 Liens
Closes #123
Related-to: #456

### 📸 Screenshots (si UI)
[Joindre avant/après si applicable]
```

### Guidelines pour les Reviewers

```python
# ✅ BON FEEDBACK
"Cette validation pourrait utiliser la fonction validateEmail() 
existante pour éviter la duplication. Voir utils/validators.py:42"

# ❌ MAUVAIS FEEDBACK
"C'est pas bon"
"Pourquoi tu as fait ça?"

# ✅ APPROUVER AVEC CONDITIONS
"Approuvé si tu corriges la variable x et ajoutes un test pour le edge case"

# ✅ SUGGÉRER UN REFACTORING
"Suggestion: extraire cette logique dans une fonction séparée 
pour améliorer la testabilité"
```

### Timeframe de Review

```
PR créée → 24h: First review
Feedback donné → 24h: Réponse du submitter
Prêt à merge → Merge immédiat (si approuvé)

Exception: PRs urgentes (hotfix, critical)
- First review: 2h max
- Merge: ASAP
```

### Review Checklist Standardisée

```markdown
## Code Quality
- [ ] Code suit les standards du projet
- [ ] Pas de duplication évidente
- [ ] Pas de TODO/FIXME en commentaire
- [ ] Logging approprié

## Functionality
- [ ] Logique métier correcte
- [ ] Edge cases gérés
- [ ] Comportement cohérent

## Performance
- [ ] Pas de N+1 queries
- [ ] Pas de boucles imbriquées inefficaces
- [ ] Pas de memory leaks potentiels

## Security
- [ ] Pas de SQL injection
- [ ] Pas de XSS
- [ ] Validation des inputs
- [ ] Pas de secrets

## Testing
- [ ] Tests unitaires présents
- [ ] Coverage > 80%
- [ ] Tests d'edge cases

## Documentation
- [ ] Code commenté (si complexe)
- [ ] README mis à jour (si applicable)
- [ ] API docs mises à jour (si applicable)
```

---

## 👨‍💻 [PAIR-PROGRAMMING] Pair Programming

### Quand Faire du Pair Programming?

```
✅ Bons cas:
- Onboarding d'un nouveau développeur
- Code critique/complexe
- Spike technique/investigation
- Mentoring junior→senior
- Résoudre un bug difficile
- Tâche bloquante pour l'équipe

❌ À éviter:
- Tasks simples/routinières
- Quand une des deux personnes est fatiguée
- Sans agenda clair
- Pour du copilote vide (juste regarder)
```

### Setup Technique Pair Programming

```bash
# Option 1: VS Code Live Share
1. Host: Extensions > Live Share > Start session
2. Guest: Copier le lien et rejoindre
3. Share terminal si besoin

# Option 2: Tuple (meilleure option pour audio/video)
1. Créer une session sur tuple.app
2. Partager le lien
3. Guest accède à l'éditeur du host

# Option 3: Screen Share + Zoom
- Partager l'écran du driver
- Excellent pour communication
- Moins efficace pour alternances
```

### Rôles en Pair Programming

```
🚗 DRIVER (code activement)
- Écrit le code
- Demande confirmation au navigator
- Focus sur la syntaxe/implémentation

🗺️ NAVIGATOR (observe et guide)
- Pense au big picture
- Vérifie la logique
- Cherche les bugs/inefficacités
- Documente les décisions

Swap tous les 15-20 minutes!
```

### Best Practices

```markdown
### Avant la Session
- [ ] Agenda clair écrit
- [ ] 30min max sans pause
- [ ] Les deux calmes et concentrés
- [ ] Environment setup complété

### Pendant la Session
- [ ] Communication continue
- [ ] Pas de silence prolongé
- [ ] Swap driver/navigator régulièrement
- [ ] Pas d'interruptions externes

### Après la Session
- [ ] Commit et push ensemble
- [ ] Débrief 5 min
- [ ] Documenter les décisions
- [ ] Ajouter des tests si nécessaire
```

---

## 🚀 [ONBOARDING] Onboarding Développeurs

### Day 1 - Setup

```markdown
## Checklist Jour 1

### Avant la première journée
- [ ] Laptop configuré (OS + tools)
- [ ] Accès GitHub/GitLab
- [ ] Accès Slack/Discord
- [ ] Accès documentation wiki
- [ ] Accès serveurs (SSH keys)

### Premier matin (2h)
- [ ] Welcome call avec le team lead
- [ ] Tour d'équipe virtuel
- [ ] Envoyé le onboarding guide
- [ ] Assigné un buddy

### Restant du jour (6h)
- [ ] Cloner les repos
- [ ] Setup environnement local (suivre README)
- [ ] Run les tests (doit passer 100%)
- [ ] Lire le CONTRIBUTING.md
```

### Week 1 - Learning

```markdown
## Semaine 1

### Day 2-3: Codebase Tour
- [ ] Buddy: pair programming sur setup complet
- [ ] Lire l'ARCHITECTURE.md
- [ ] Faire un commit mineur (hello world)
- [ ] Merger la PR (avec review du buddy)

### Day 4: First Real Task
- [ ] Task: bug simple ou feature mineure
- [ ] Deadline: vendredi EOD
- [ ] Buddy: daily standups et disponible

### Day 5: Retrospective
- [ ] 1:1 avec tech lead
- [ ] Feedback sur la semaine
- [ ] Ajustements si nécessaire
```

### Week 2-4 - Integration

```markdown
## Semaines 2-4

### Progression
- Week 2: Tasks simples (bugs, refactoring)
- Week 3: Petites features
- Week 4: Features plus complexes

### Support Continu
- [ ] Pair programming 1x/jour (si demandé)
- [ ] Code reviews très détaillées
- [ ] Architecture guidance si besoin
- [ ] Pair programming optionnel

### Check-ins
- [ ] Lundi: Semaine preview
- [ ] Jeudi: Progression check
- [ ] Vendredi: Weekly retro 1:1
```

### Onboarding Checklist

```markdown
## Checklist Complète Onboarding

### Technical Setup
- [ ] Git configuré (SSH keys, GPG)
- [ ] IDE configuré (ESLint, Prettier, etc.)
- [ ] Environment variables (.env)
- [ ] Database setup (migrations)
- [ ] Services locaux (Docker containers)
- [ ] Tests: 100% passants

### Knowledge
- [ ] Architecture lue et comprise
- [ ] Stack technologique compris
- [ ] Conventions du projet connues
- [ ] Processus de deployment expliqué
- [ ] Monitoring/logging expliqué

### Access & Permissions
- [ ] GitHub/GitLab: full access
- [ ] Slack: tous les channels
- [ ] Production: READ-ONLY accès (minimum)
- [ ] Monitoring: dashboard accès
- [ ] Documentation wiki: write access

### Social Integration
- [ ] Présenté à l'équipe
- [ ] Buddy assigné
- [ ] Calendrier partagé
- [ ] Slack introductions
- [ ] Lunch virtuel avec team

### First Contribution
- [ ] Première PR reviewed + merged
- [ ] Commit push en production (guidé)
- [ ] Feedback reçu et traité
```

---

## 📞 [COMMUNICATION] Communication Asynchrone

### Slack Best Practices

```markdown
### Quand Utiliser
- Questions quick (< 5 min de réponse)
- Notifications urgentes (bug en prod)
- Discussions rapides (pas pour décisions)

### Structure de Message
1. Contexte (1 ligne)
2. Détail (2-3 lignes)
3. Action requise (clair et explicite)

### Exemple ✅
"API est down depuis 10 min.
Erreur: connection timeout au DB.
ACTION: Besoin d'ops pour restart la DB service."

### Exemple ❌
"Ça marche pas"
"Urgent!!!"
"quelqu'un peut regarder?"
```

### Email pour Décisions Importantes

```markdown
### Quand Utiliser Email
- Décisions architecturales
- Changements de standards
- Post-mortems
- Offres d'emploi / departures

### Template Email Décision
Subject: [DECISION] Titre clair

Pour: [Stakeholders]

## Contexte
[Situation et problème]

## Options Considérées
1. Option A: [Pro] [Con]
2. Option B: [Pro] [Con]
3. Option C: [Pro] [Con]

## Recommandation
Option X car [raisons clés]

## Timeline
- Deadline pour feedback: [date]
- Implementation: [date]

## Discussions
Commentaires dans le thread email, 
ou sync meeting [date/time]
```

### Documentation pour Savoir Permanent

```markdown
### Wiki/Docs vs Messages

❌ Ne pas documenter dans Slack
- Décisions architecturales
- Processus opérationnels
- Runbooks/procedures
- Lessons learned

✅ Documenter dans Wiki
- Tout ce qui précède
- + FAQ
- + Troubleshooting
- + Internal knowledge
```

---

## 🎓 [KNOWLEDGE-SHARING] Partage de Connaissance

### Weekly Tech Talk

```markdown
## Format
- Durée: 30 minutes
- Fréquence: Jeudi 14h
- Animateur: Chacun son tour
- Topic: Libre (tech, learnings, etc.)

## Structure
1. Intro (2 min): Contexte du topic
2. Main (20 min): Contenu
3. Demo (5 min): Optionnel
4. Q&A (3 min): Questions

## Topics Exemples
- "How I debugged a production issue"
- "New feature in our API"
- "Learnings from on-call"
- "Tool recommendation"
```

### RFCs (Request For Comments)

```markdown
## Quand Faire un RFC
- Changement architectural majeur
- Nouvelle dépendance (heavy)
- Standards process
- Infrastructure changes

## Template RFC
# RFC: [Titre]

## Motivation
Pourquoi ce changement?

## Proposed Solution
Description de la solution

## Alternatives
Autres options considérées

## Impacts
- Performance
- Maintenance
- Learning curve

## Timeline
- Feedback period: 1 week
- Implementation: [date]

## Authors
Who proposed this
```

### Learning Paths

```markdown
## Structured Learning

### Onboarding Path (Month 1)
- Day 1-5: Setup & codebase tour
- Week 2: Architecture deep dive
- Week 3: First real task
- Week 4: Confidence check

### Growth Path (Quarters)
- Q1: Specialist in one area
- Q2: Comfortable across codebase
- Q3: Can mentor others
- Q4: Lead a project
```

---

## 🏆 [STANDARDS] Expectations & Performance

### Code Review SLA

```
📊 Metrics
- First review within: 24h
- Resolution within: 48h
- Approval rate: 80%+ (should merge)

🎯 Goals
- Maintain code quality
- Knowledge transfer
- Faster iteration
```

### Pair Programming Expectations

```
🎯 Targets
- 1 pair session/week minimum
- Focus on onboarding/complex tasks
- Knowledge sharing priority
```

### Contribution Quality

```
✅ Expected
- Tests pour chaque feature
- Documentation update
- No technical debt increase
- Performance verified

📈 Tracking
- PR review time
- Test coverage
- Production incidents
```

---

## ✅ Checklist Collaboration

- [ ] PR template configuré ✅
- [ ] Code review process documenté ✅
- [ ] Pair programming guidelines établis ✅
- [ ] Onboarding checklist créé ✅
- [ ] Communication guidelines claires ✅
- [ ] Tech talks hebdomadaires ✅
- [ ] RFC process en place ✅
- [ ] SLAs définis ✅
- [ ] Knowledge base accessible ✅
- [ ] Mentoring program actif ✅

---

**📌 Note**: Une bonne collaboration = équipe productive et heureuse.
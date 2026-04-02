# 🚀 Intégration API RAG - Guide pour les Instructions IA

**Version**: 1.0 | **Statut**: Active | **Mobile First**: ✅ Obligatoire

---

## 🎯 Vue d'Ensemble

L'API RAG Darkmedia-X permet d'indexer et rechercher intelligemment dans vos documentations avec une recherche sémantique vectorisée. Cette intégration est **complètement configurée** dans ce repository.

### Qu'est-ce qu'une RAG?
**RAG** = Retrieval-Augmented Generation
- 🔍 **Recherche sémantique** dans une base vectorielle (Qdrant)
- 📚 **Récupération intelligente** de documents pertinents
- 🤖 **Augmentation** pour les LLM (GPT-4, Claude, etc.)

---

## 📁 Fichiers de Configuration

### À la Racine du Projet
| Fichier | Rôle |
|---------|------|
| `index_rag.py` | Script d'indexation automatique |
| `rag-client.js` | Client JavaScript réutilisable |
| `rag_client.py` | Client Python réutilisable |
| `push.py` | Workflow Git + indexation |
| `verify_rag_setup.py` | Vérification de la configuration |
| `.env.example` | Template pour variables d'env |
| `requirements-rag.txt` | Dépendances Python |
| `RAG_README.md` | README complet |

### Dans `.docs/`
| Fichier | Contenu |
|---------|---------|
| `API_RAG_USAGE.md` | Documentation API complète |
| `RAG_SETUP.md` | Guide d'intégration détaillé |
| `EXAMPLES.md` | 10 exemples d'intégration |

### Dashboard
| Chemin | Fonction |
|--------|----------|
| `.dashboard/index.html` | Interface Mobile First avec cache |

---

## ⚡ Commandes Essentielles

### Vérifier la Configuration
```bash
# Exécuter la vérification complète
python verify_rag_setup.py

# Vérifier juste la connexion API
python index_rag.py --verify
```

### Indexer les Documents
```bash
# Indexer .instructions-ai (par défaut)
python index_rag.py

# Indexer un autre répertoire
python index_rag.py .docs

# Utiliser Qdrant local
python index_rag.py --local

# Personnaliser la taille des batches
python index_rag.py --batch-size 100
```

### Workflow Git Amélioré
```bash
# Commit + indexation + push en une seule commande
python push.py

# Le script propose automatiquement l'indexation pour:
# - feat: nouvelles fonctionnalités
# - docs: modifications de documentation
# - fix: corrections de bugs
```

---

## 🔐 Configuration Requise

### Clés API (Obligatoire pour l'indexation)

Vous avez besoin d'une clé API serveur pour indexer les documents.

**Option 1: Variable d'Environnement**
```bash
# Windows PowerShell
$env:DM_SERVER_API_KEY = "DM-SERVER-1a2b3c4d5e6f7g8h9i0j"

# Linux/macOS
export DM_SERVER_API_KEY="DM-SERVER-1a2b3c4d5e6f7g8h9i0j"
```

**Option 2: Fichier .env**
```bash
# Copier le template
cp .env.example .env

# Éditer .env avec votre clé
DM_SERVER_API_KEY=DM-SERVER-1a2b3c4d5e6f7g8h9i0j
```

**Option 3: Argument de ligne de commande**
```bash
python index_rag.py --api-key "DM-SERVER-1a2b3c4d5e6f7g8h9i0j"
```

---

## 🎨 Mobile First Design - Obligatoire

Toutes les interfaces consommant l'API RAG DOIVENT être Mobile First.

### Principes à Respecter
1. **Commencer par mobile** (320px par défaut)
2. **Adapter le `limit`** selon l'écran (3 mobile, 10 desktop)
3. **Touch targets** min 44x44px
4. **Texte lisible** min 16px
5. **Pas de scroll horizontal**
6. **Cache intégré** pour réduire les appels API

### Exemple - JavaScript
```javascript
const rag = new RAGClient(API_KEY, {
  isMobile: window.innerWidth < 768,
  cacheEnabled: true,
  cacheExpiry: 3600000  // 1h
});

// Limit automatiquement adapté
await rag.search('requête');  // 3 résultats si mobile, 10 sinon
```

### Exemple - CSS Mobile First
```css
/* Mobile (par défaut) */
.results-grid {
  grid-template-columns: 1fr;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .results-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🔍 Utilisation Basique

### JavaScript/Frontend
```javascript
<!-- Charger le client -->
<script src="rag-client.js"></script>

<script>
  // Initialiser
  const rag = new RAGClient('DM-CLIENT-7f8a9b2c3d4e5f6g7h8i9j');
  
  // Recherche formatée (pour UI)
  const result = await rag.searchFormatted('Ma requête');
  
  console.log(result);
  // {
  //   success: true,
  //   query: 'Ma requête',
  //   count: 3,
  //   results: [
  //     { title, excerpt, score, metadata },
  //     ...
  //   ]
  // }
</script>
```

### Python/Backend
```python
from rag_client import RAGClient, RAGSearcher

# Client simple
client = RAGClient('DM-CLIENT-7f8a9b2c3d4e5f6g7h8i9j')
result = client.search('Ma requête')

# Avec formatage et historique
searcher = RAGSearcher('DM-CLIENT-7f8a9b2c3d4e5f6g7h8i9j')
result = searcher.search('Ma requête')
searcher.print_results(result)
```

### Indexation
```python
from index_rag import RAGIndexer

# Indexer via l'API (défaut)
indexer = RAGIndexer()
indexer.load_and_index_md('.instructions-ai')

# Ou utiliser Qdrant local
indexer = RAGIndexer(local_qdrant=True)
indexer.load_and_index_md('.instructions-ai')
```

---

## 📊 Architecture

```
┌─────────────────────────────────────┐
│ Documentations (markdown)            │
│ .instructions-ai/, .docs/            │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  index_rag.py  │ (Indexation)
        └────────┬───────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │  API RAG Darkmedia-X     │
    │  (FastAPI + Qdrant)      │
    └──────────────────────────┘
         ▲              ▲
         │              │
    ┌────┴────┐    ┌────┴────────┐
    │ Frontend │    │ Backend API │
    │ (JS)     │    │ (Python)    │
    │ RAG      │    │ RAG         │
    │ Client   │    │ Client      │
    └──────────┘    └─────────────┘
```

---

## 🎯 Cas d'Usage Courants

### 1. Ajouter une Nouvelle Documentation
```bash
# Ajouter les fichiers .md à .instructions-ai/
git add .instructions-ai/

# Utiliser le workflow amélioré
python push.py
# → Propose automatiquement l'indexation
# → Indexe les docs
# → Push vers Git
```

### 2. Créer un Dashboard de Recherche
```bash
# Copier le client JavaScript
cp rag-client.js mon-projet/src/

# Dans votre HTML
<script src="src/rag-client.js"></script>

# Utilisez la classe RAGClient (voir exemples dans EXAMPLES.md)
```

### 3. Intégrer dans une App Python
```bash
# Copier le client
cp rag_client.py mon-app/lib/

# Dans votre code
from lib.rag_client import RAGClient
client = RAGClient('YOUR_KEY')
```

### 4. Automatiser l'Indexation
```bash
# Linux/macOS - Ajouter au cron
0 2 * * * cd /path/to/project && python index_rag.py

# Windows - Task Scheduler
# Créer une tâche qui exécute: python index_rag.py
```

---

## 🐛 Dépannage

### "API RAG indisponible"
```bash
# Vérifier la connexion
python index_rag.py --verify

# Utiliser le fallback Qdrant local
python index_rag.py --local
```

### "Clé API invalide"
```bash
# Vérifier que DM_SERVER_API_KEY est définie
echo $DM_SERVER_API_KEY

# Ou copier depuis .env
source .env
```

### "Indexation lente"
```bash
# Réduire la taille des batches
python index_rag.py --batch-size 25

# Ou augmenter
python index_rag.py --batch-size 100
```

### Exécuter une Vérification Complète
```bash
python verify_rag_setup.py
```

---

## 📚 Documentation Détaillée

Pour plus de détails:
- **[RAG_README.md](../RAG_README.md)** - Vue d'ensemble complète
- **[.docs/API_RAG_USAGE.md](../.docs/API_RAG_USAGE.md)** - Référence API
- **[.docs/RAG_SETUP.md](../.docs/RAG_SETUP.md)** - Guide d'intégration
- **[.docs/EXAMPLES.md](../.docs/EXAMPLES.md)** - 10 exemples pratiques
- **[08-ui-ux-guidelines.md](./08-ui-ux-guidelines.md)** - Guidelines Mobile First

---

## ✅ Checklist de Démarrage

- [ ] Clé API `DM_SERVER_API_KEY` configurée
- [ ] Vérification réussie: `python verify_rag_setup.py`
- [ ] Test d'indexation: `python index_rag.py --verify`
- [ ] Premiers documents indexés: `python index_rag.py`
- [ ] Dashboard testé: `.dashboard/index.html`
- [ ] Client JavaScript intégré dans vos projets
- [ ] Client Python utilisé dans vos apps
- [ ] Workflow `push.py` testé
- [ ] Indexation automatique configurée (optionnel)

---

## 🎓 Ressources

- **Repository API RAG**: https://github.com/darkmedia-x/darkmedia-x_api-rag
- **API Endpoint**: https://darkmedia-xapi-rag.vercel.app
- **Qdrant Docs**: https://qdrant.tech/documentation/

---

## 🚀 Prochaines Étapes

1. Exécutez `python verify_rag_setup.py` pour vérifier votre configuration
2. Indexez vos documents: `python index_rag.py`
3. Testez le dashboard: `.dashboard/index.html`
4. Intégrez le client dans vos projets (voir EXAMPLES.md)
5. Configurez l'indexation automatique (optionnel)

---

## 💡 Astuces Avancées

### Combiner RAG + LLM
```python
from rag_client import RAGClient
import openai

# Chercher avec RAG
rag = RAGClient('YOUR_KEY')
results = rag.search('Ma question')

# Augmenter avec une LLM
context = "\n".join([r['content'] for r in results['data']])
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": f"Context: {context}"},
        {"role": "user", "content": "Ma question"}
    ]
)
```

### Cacher les Résultats Côté Client
```javascript
// Cache automatique pour 1h
const rag = new RAGClient(API_KEY, {
  cacheEnabled: true,
  cacheExpiry: 3600000
});

// Voir les stats de cache
const stats = rag.getCacheStats();
console.log(`${stats.size} requêtes en cache`);

// Vider le cache
rag.clearCache();
```

### Indexation avec Métadonnées Enrichies
```python
from index_rag import RAGIndexer

indexer = RAGIndexer()

# Charger et ajouter des métadonnées
items = [
    {
        "content": "Votre documentation...",
        "metadata": {
            "category": "guide",
            "priority": "high",
            "author": "Vous",
            "tags": ["python", "api"]
        },
        "point_id": 1
    }
]

indexer.index_via_api(items)
```

---

## 📞 Support

Si vous avez des questions ou des problèmes:
1. Consultez la documentation dans `.docs/`
2. Exécutez `python verify_rag_setup.py`
3. Vérifiez les exemples dans `.docs/EXAMPLES.md`
4. Créez une issue sur GitHub

---

**🎯 Objectif**: Une base de connaissances vectorisée et searchable dans toutes vos applications, avec design Mobile First.

**Status**: ✅ Prêt à l'emploi | **Mobile First**: ✅ Obligatoire | **Cache**: ✅ Intégré | **Sécurité**: ✅ Best Practices
# 🐍 Bonnes Pratiques Python

**Version**: 2.0 | **Stack**: Ruff + Pre-commit + Qdrant | **Python**: 3.10+

---

## 🏗️ [SETUP] Configuration Initiale

### Environnement Virtuel

```powershell
# Création et activation (Windows)
python -m venv venv
.\venv\Scripts\activate

# Création et activation (Linux/macOS)
python -m venv venv
source venv/bin/activate
```

### Dépendances de Base

```bash
pip install --upgrade pip setuptools wheel

# Stack Darkmedia-X
pip install ruff pre-commit python-dotenv qdrant-client sentence-transformers

# Tests
pip install pytest pytest-cov
```

---

## ⚙️ [CONFIG] pyproject.toml

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "Description du projet"
authors = [{name = "Darkmedia-X", email = "contact@darkmedia-x.dev"}]
requires-python = ">=3.10"
dependencies = [
    "qdrant-client>=2.0.0",
    "sentence-transformers>=2.2.0",
    "python-dotenv>=1.0.0",
]

[tool.ruff]
line-length = 100
target-version = "py310"
extend-select = ["E", "F", "I", "N", "RUF", "C4"]
extend-ignore = ["E501"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false

[tool.ruff.isort]
known-first-party = ["src"]
force-single-line = false

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--cov=src --cov-report=html --cov-fail-under=80"

[build-system]
requires = ["setuptools", "wheel"]
build-backend = "setuptools.build_meta"
```

---

## 🔧 [RUFF] Linting et Formatage

Ruff remplace **Flake8**, **Black** et **Isort** en un seul outil ultra-rapide.

```bash
# Vérifier les erreurs
ruff check .

# Corriger automatiquement
ruff check . --fix

# Formater le code
ruff format .

# Vérifier le format sans modifier
ruff format . --check
```

### Configuration VSCode

`.vscode/settings.json` :

```json
{
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  }
}
```

---

## 🪝 [PRECOMMIT] Hooks Automatisés

### Installation

```bash
pip install pre-commit
pre-commit install
```

### `.pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.0
    hooks:
      - id: ruff
        args: ["--fix"]
      - id: ruff-format

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: detect-private-key

  - repo: https://github.com/adrienverge/yamllint
    rev: v1.33.0
    hooks:
      - id: yamllint
```

```bash
# Exécution manuelle
pre-commit run --all-files
```

---

## 🧠 [QDRANT] Intégration Mémoire Centralisée

### Module Réutilisable `qdrant_core.py`

```python
"""
Module centralisé Qdrant — Réutilisable dans tous les projets Darkmedia-X.
Gère la connexion, l'indexation et les recherches vectorielles.
"""

import os
from typing import Any

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

load_dotenv()


class QdrantMemory:
    """Interface centralisée pour Qdrant."""

    def __init__(self, collection_name: str, vector_size: int = 384):
        """
        Initialise la connexion Qdrant.

        Args:
            collection_name: Nom de la collection à utiliser
            vector_size: Dimension des vecteurs (défaut: 384 pour MiniLM)
        """
        self.client = QdrantClient(
            url=os.getenv("QDRANT_URL", "http://localhost:6333"),
            api_key=os.getenv("QDRANT_API_KEY"),
        )
        self.collection_name = collection_name
        self.vector_size = vector_size
        self._ensure_collection()

    def _ensure_collection(self) -> None:
        """Crée la collection si elle n'existe pas encore."""
        collections = [c.name for c in self.client.get_collections().collections]
        if self.collection_name not in collections:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE,
                ),
            )

    def add(self, points: list[PointStruct]) -> bool:
        """
        Ajoute ou met à jour des points dans la collection.

        Args:
            points: Liste de PointStruct à insérer

        Returns:
            True si succès, False sinon
        """
        try:
            self.client.upsert(collection_name=self.collection_name, points=points)
            return True
        except Exception as e:
            print(f"[QdrantMemory] Erreur lors de l'ajout: {e}")
            return False

    def search(self, vector: list[float], limit: int = 10) -> list[dict[str, Any]]:
        """
        Recherche les points les plus similaires.

        Args:
            vector: Vecteur de requête
            limit: Nombre de résultats maximum

        Returns:
            Liste de résultats avec id, score et payload
        """
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=vector,
            limit=limit,
        )
        return [{"id": r.id, "score": r.score, "payload": r.payload} for r in results]

    def delete(self, point_ids: list[int]) -> bool:
        """
        Supprime des points par leurs IDs.

        Args:
            point_ids: Liste d'IDs à supprimer

        Returns:
            True si succès, False sinon
        """
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=point_ids,
            )
            return True
        except Exception as e:
            print(f"[QdrantMemory] Erreur lors de la suppression: {e}")
            return False

    def count(self) -> int:
        """Retourne le nombre de points dans la collection."""
        result = self.client.count(collection_name=self.collection_name)
        return result.count
```

### Variables d'Environnement `.env`

```env
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_api_key_here
QDRANT_COLLECTION_NAME=default
```

### Utilisation

```python
from qdrant_client.models import PointStruct
from src.core.qdrant_core import QdrantMemory

memory = QdrantMemory("my_collection")

# Ajouter
points = [
    PointStruct(id=1, vector=[0.1] * 384, payload={"text": "Info 1"}),
    PointStruct(id=2, vector=[0.2] * 384, payload={"text": "Info 2"}),
]
memory.add(points)

# Rechercher
results = memory.search([0.15] * 384, limit=5)
for r in results:
    print(f"Score: {r['score']:.3f} | {r['payload']['text']}")
```

---

## 📐 [PATTERNS] Conventions de Code

### Imports

```python
# ✅ BON — Groupes dans l'ordre : stdlib, tiers, local
import os
import re
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

from src.core.qdrant_core import QdrantMemory
from src.utils import helpers
```

### Type Hints

```python
# ✅ Toujours typer les arguments et retours
def process_items(items: list[str], limit: int = 10) -> dict[str, Any]:
    """Traite une liste d'éléments."""
    return {item: len(item) for item in items[:limit]}
```

### Gestion des Erreurs

```python
import logging

logger = logging.getLogger(__name__)

try:
    result = dangerous_operation()
except ValueError as e:
    logger.error("Valeur invalide: %s", e)
    raise
except Exception:
    logger.exception("Erreur inattendue")
    return None
```

---

## 📁 [STRUCTURE] Structure de Projet

```
my_project/
├── venv/
├── src/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── qdrant_core.py
│   ├── utils/
│   │   └── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── .pre-commit-config.yaml
├── .editorconfig
├── pyproject.toml
└── README.md
```

---

## ✅ Checklist de Qualité Python

- [ ] `ruff check . --fix` — 0 erreurs
- [ ] `ruff format .` — code formaté
- [ ] `pre-commit run --all-files` — tous les hooks passent
- [ ] `pytest --cov=src` — couverture > 80%
- [ ] Type hints sur toutes les fonctions publiques
- [ ] Docstrings sur toutes les fonctions publiques
- [ ] `.env` dans `.gitignore`
- [ ] `.env.example` à jour

---

**📌 Note** : Ces standards s'appliquent à **tous** les projets Python Darkmedia-X sans exception.
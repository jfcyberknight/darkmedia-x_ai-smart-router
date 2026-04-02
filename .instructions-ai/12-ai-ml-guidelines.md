# 🤖 Directives AI/ML et Qdrant

**Version**: 2.0 | **Stack**: Qdrant + Sentence-Transformers + LLM Integration

---

## 🎯 [OVERVIEW] Architecture AI/ML Darkmedia-X

### Principes Fondamentaux
- ✅ Mémoire centralisée via **Qdrant** (vecteurs)
- ✅ Embeddings avec **Sentence-Transformers**
- ✅ Recherche sémantique et RAG patterns
- ✅ Fine-tuning et adaptation progressive
- ✅ Evaluation constante des performances

---

## 📚 [QDRANT] Intégration Qdrant Centralisée

### Architecture Mémoire
```
┌─────────────────────────────────────┐
│   Application/Service               │
├─────────────────────────────────────┤
│   QdrantMemory (qdrant_core.py)    │
│   - Add / Search / Delete           │
├─────────────────────────────────────┤
│   Qdrant Server (Vector Database)   │
│   - Collections                     │
│   - Indexing (HNSW)                │
└─────────────────────────────────────┘
```

### Collections Standard

```python
from qdrant_client.models import PointStruct
from src.core.qdrant_core import QdrantMemory

# Collections recommandées pour projets Darkmedia-X
COLLECTIONS = {
    "documents": {
        "description": "Base de documents indexés",
        "vector_size": 384,  # MiniLM
        "payload_schema": {
            "text": "str",
            "source": "str",
            "created_at": "datetime",
            "metadata": "dict"
        }
    },
    "conversations": {
        "description": "Historique des conversations",
        "vector_size": 384,
        "payload_schema": {
            "user_id": "str",
            "message": "str",
            "role": "str",  # user, assistant, system
            "timestamp": "datetime"
        }
    },
    "embeddings_cache": {
        "description": "Cache d'embeddings pour réutilisation",
        "vector_size": 384,
        "payload_schema": {
            "text_hash": "str",
            "original_text": "str",
            "model": "str"
        }
    },
    "user_profiles": {
        "description": "Profils utilisateurs vectorisés",
        "vector_size": 384,
        "payload_schema": {
            "user_id": "str",
            "interests": "list",
            "history_summary": "str"
        }
    }
}
```

### Opérations Courantes

```python
from sentence_transformers import SentenceTransformer
from qdrant_client.models import PointStruct
from src.core.qdrant_core import QdrantMemory

# Initialisation
model = SentenceTransformer("all-MiniLM-L6-v2")  # 384 dimensions
memory = QdrantMemory("documents")

# 1. Ajouter des documents
documents = [
    "Qdrant est une base de vecteurs haute performance",
    "Les embeddings permettent la recherche sémantique",
    "RAG combine recherche + génération"
]

points = [
    PointStruct(
        id=i,
        vector=model.encode(doc).tolist(),
        payload={"text": doc, "source": "training"}
    )
    for i, doc in enumerate(documents)
]
memory.add(points)

# 2. Recherche sémantique
query = "Comment utiliser les vecteurs?"
query_vector = model.encode(query).tolist()
results = memory.search(query_vector, limit=3)

for result in results:
    print(f"Score: {result['score']:.3f} | {result['payload']['text']}")

# 3. Filtrage par payload
from qdrant_client.models import Filter, FieldCondition, MatchValue

filtered_results = memory.client.search(
    collection_name="documents",
    query_vector=query_vector,
    query_filter=Filter(
        must=[
            FieldCondition(
                key="source",
                match=MatchValue(value="training")
            )
        ]
    ),
    limit=5
)

# 4. Mise à jour
memory.delete([0, 1])
memory.add([new_point])

# 5. Count
count = memory.count()
print(f"Total documents: {count}")
```

---

## 🧠 [EMBEDDINGS] Modèles d'Embeddings

### Modèles Recommandés

```python
from sentence_transformers import SentenceTransformer

# Pour la plupart des cas (recommandé pour Darkmedia-X)
model_mini = SentenceTransformer("all-MiniLM-L6-v2")
# - Dimensions: 384
# - Speed: Très rapide
# - Qualité: Très bon
# - Cas: Documents, conversations, profils utilisateurs

# Pour haute qualité
model_large = SentenceTransformer("all-mpnet-base-v2")
# - Dimensions: 768
# - Speed: Moyen
# - Qualité: Excellent
# - Cas: Recherche critique, semantic matching strict

# Pour français spécifiquement
model_fr = SentenceTransformer("distiluse-base-multilingual-cased-v2")
# - Dimensions: 512
# - Speed: Rapide
# - Qualité: Bon pour multilingue
# - Cas: Contenu francophone, applications multilingues

# Pour code et techniques
model_code = SentenceTransformer("code-search-distilroberta-base")
# - Dimensions: 768
# - Speed: Rapide
# - Qualité: Excellent pour code
# - Cas: Documentation technique, snippets de code
```

### Pipeline d'Embedding

```python
from sentence_transformers import SentenceTransformer
from typing import List

class EmbeddingPipeline:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.cache = {}  # Cache en mémoire
    
    def embed_single(self, text: str) -> List[float]:
        """Embed un texte simple."""
        # Nettoyer et normaliser
        text = text.strip().lower()
        
        # Vérifier le cache
        if text in self.cache:
            return self.cache[text]
        
        # Générer l'embedding
        embedding = self.model.encode(text, convert_to_tensor=False)
        
        # Cacher
        self.cache[text] = embedding.tolist()
        return embedding.tolist()
    
    def embed_batch(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """Embed plusieurs textes en batch (plus efficace)."""
        return self.model.encode(texts, batch_size=batch_size, convert_to_tensor=False).tolist()
    
    def embed_with_metadata(self, texts: List[str], metadata: List[dict]) -> List[dict]:
        """Embed avec métadonnées associées."""
        embeddings = self.embed_batch(texts)
        return [
            {
                "text": text,
                "embedding": emb,
                "metadata": meta
            }
            for text, emb, meta in zip(texts, embeddings, metadata)
        ]
```

---

## 🔍 [RAG] Retrieval-Augmented Generation Pattern

### Architecture RAG Complète

```python
from sentence_transformers import SentenceTransformer
from src.core.qdrant_core import QdrantMemory
from typing import List, Dict, Any

class RAGSystem:
    """Système RAG complet avec Qdrant + LLM."""
    
    def __init__(self, llm_client, embedding_model: str = "all-MiniLM-L6-v2"):
        self.llm = llm_client  # OpenAI, Claude, etc.
        self.embeddings = SentenceTransformer(embedding_model)
        self.memory = QdrantMemory("rag_documents")
    
    def index_documents(self, documents: List[str], metadata: List[dict] = None):
        """Index les documents pour la recherche."""
        from qdrant_client.models import PointStruct
        
        embeddings = self.embeddings.encode(documents)
        points = [
            PointStruct(
                id=i,
                vector=emb.tolist(),
                payload={
                    "text": doc,
                    "metadata": metadata[i] if metadata else {}
                }
            )
            for i, (doc, emb) in enumerate(zip(documents, embeddings))
        ]
        self.memory.add(points)
    
    def retrieve(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Récupère les documents les plus pertinents."""
        query_embedding = self.embeddings.encode(query).tolist()
        results = self.memory.search(query_embedding, limit=k)
        return results
    
    def generate_answer(self, query: str, context_docs: List[Dict]) -> str:
        """Génère une réponse basée sur le contexte récupéré."""
        # Construire le contexte
        context = "\n\n".join([
            f"[Source {i+1}]\n{doc['payload']['text']}"
            for i, doc in enumerate(context_docs)
        ])
        
        # Prompt RAG
        system_prompt = """Tu es un assistant expert. Réponds à la question en utilisant 
        uniquement les informations fournies dans le contexte. Si le contexte ne contient pas 
        la réponse, dis-le clairement."""
        
        user_message = f"""Contexte:
{context}

Question: {query}

Réponds de manière concise et précise."""
        
        # Appel LLM
        response = self.llm.create_message(
            system=system_prompt,
            user=user_message
        )
        return response
    
    def answer_with_sources(self, query: str, k: int = 5) -> Dict[str, Any]:
        """Répond à une question et retourne les sources utilisées."""
        # Récupérer les documents pertinents
        context_docs = self.retrieve(query, k=k)
        
        # Générer la réponse
        answer = self.generate_answer(query, context_docs)
        
        # Retourner avec sources
        return {
            "answer": answer,
            "sources": [
                {
                    "text": doc['payload']['text'][:100],
                    "score": doc['score'],
                    "metadata": doc['payload'].get('metadata', {})
                }
                for doc in context_docs
            ]
        }
```

### Exemple d'Utilisation RAG

```python
# Initialisation
rag = RAGSystem(llm_client=openai_client)

# 1. Indexer les documents
documents = [
    "Qdrant est optimisé pour les recherches de vecteurs",
    "Les embeddings permettent la recherche sémantique",
    "RAG améliore la précision des réponses LLM"
]
rag.index_documents(documents)

# 2. Répondre à une question
query = "Comment fonctionne la recherche sémantique?"
result = rag.answer_with_sources(query, k=3)

print(f"Réponse: {result['answer']}")
print(f"\nSources:")
for source in result['sources']:
    print(f"- {source['text'][:50]}... (score: {source['score']:.3f})")
```

---

## 🎓 [FINETUNING] Fine-tuning et Adaptation

### Fine-tuning d'Embeddings

```python
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

class EmbeddingFineTuner:
    """Fine-tuner des embeddings sur données spécifiques."""
    
    def __init__(self, base_model: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(base_model)
    
    def prepare_training_data(self, pairs: List[tuple]) -> List[InputExample]:
        """
        Prépare les données pour le fine-tuning.
        
        pairs: [(text1, text2, label), ...] où label ∈ [0, 1]
               label=1 si textes similaires, 0 sinon
        """
        return [
            InputExample(texts=[pair[0], pair[1]], label=pair[2])
            for pair in pairs
        ]
    
    def finetune(self, training_pairs: List[tuple], epochs: int = 1, batch_size: int = 16):
        """Fine-tune le modèle."""
        train_examples = self.prepare_training_data(training_pairs)
        train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)
        
        train_loss = losses.CosineSimilarityLoss(self.model)
        
        self.model.fit(
            train_objectives=[(train_dataloader, train_loss)],
            epochs=epochs,
            warmup_steps=100
        )
    
    def save(self, path: str):
        """Sauvegarde le modèle fine-tuned."""
        self.model.save(path)
    
    def load(self, path: str):
        """Charge un modèle fine-tuned."""
        self.model = SentenceTransformer(path)
```

### Adaptation Progressive

```python
class AdaptiveRAG:
    """RAG qui s'améliore avec les retours utilisateurs."""
    
    def __init__(self, base_rag: RAGSystem):
        self.rag = base_rag
        self.feedback_data = []  # Historique des retours
    
    def answer_with_feedback(self, query: str) -> Dict:
        """Répond et demande du feedback."""
        result = self.rag.answer_with_sources(query)
        result['feedback_id'] = hash(query)  # ID unique pour le suivi
        return result
    
    def record_feedback(self, feedback_id: int, rating: int, correct_answer: str = None):
        """Enregistre le feedback de l'utilisateur."""
        feedback = {
            'id': feedback_id,
            'rating': rating,  # 1-5 stars
            'correct_answer': correct_answer
        }
        self.feedback_data.append(feedback)
    
    def retrain_on_feedback(self):
        """Réentraîne le modèle avec les retours."""
        # Construire un dataset de fine-tuning
        training_pairs = []
        
        for feedback in self.feedback_data:
            if feedback['rating'] < 3:
                # Paire négative - pas utile
                training_pairs.append((
                    feedback['query'],
                    feedback['retrieved_docs'],
                    0
                ))
            else:
                # Paire positive - très utile
                training_pairs.append((
                    feedback['query'],
                    feedback['correct_answer'],
                    1
                ))
        
        # Fine-tune
        if training_pairs:
            self.rag.embeddings.finetune(training_pairs)
```

---

## 📊 [EVALUATION] Evaluation et Metrics

### Metrics Standard

```python
from sklearn.metrics.pairwise import cosine_similarity
from typing import List
import numpy as np

class RAGEvaluator:
    """Evaluation des systèmes RAG."""
    
    def __init__(self, ground_truth: List[Dict]):
        """
        ground_truth: [
            {
                'query': 'question',
                'relevant_docs': ['doc1', 'doc2'],
                'expected_answer': 'réponse attendue'
            },
            ...
        ]
        """
        self.ground_truth = ground_truth
    
    def evaluate_retrieval(self, rag_system, k: int = 5) -> Dict:
        """Évalue la qualité de la récupération."""
        metrics = {
            'precision': [],
            'recall': [],
            'mrr': []  # Mean Reciprocal Rank
        }
        
        for item in self.ground_truth:
            query = item['query']
            relevant = set(item['relevant_docs'])
            
            # Récupérer les documents
            results = rag_system.retrieve(query, k=k)
            retrieved = set([r['payload']['text'] for r in results])
            
            # Precision@k
            if retrieved:
                precision = len(relevant & retrieved) / len(retrieved)
                metrics['precision'].append(precision)
            
            # Recall@k
            if relevant:
                recall = len(relevant & retrieved) / len(relevant)
                metrics['recall'].append(recall)
            
            # MRR
            for rank, result in enumerate(results, 1):
                if result['payload']['text'] in relevant:
                    metrics['mrr'].append(1.0 / rank)
                    break
            else:
                metrics['mrr'].append(0)
        
        # Moyennes
        return {
            'mean_precision': np.mean(metrics['precision']),
            'mean_recall': np.mean(metrics['recall']),
            'mrr': np.mean(metrics['mrr'])
        }
    
    def evaluate_generation(self, rag_system) -> Dict:
        """Évalue la qualité des réponses générées."""
        from nltk.translate.bleu_score import sentence_bleu
        from rouge_score import rouge_scorer
        
        scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'])
        bleu_scores = []
        rouge_scores = []
        
        for item in self.ground_truth:
            generated = rag_system.rag.generate_answer(item['query'], [])
            expected = item['expected_answer']
            
            # BLEU score
            bleu = sentence_bleu([expected.split()], generated.split())
            bleu_scores.append(bleu)
            
            # ROUGE score
            rouge = scorer.score(expected, generated)
            rouge_scores.append(rouge['rougeL'].fmeasure)
        
        return {
            'bleu': np.mean(bleu_scores),
            'rouge_l': np.mean(rouge_scores)
        }
```

---

## 🔧 [PRODUCTION] AI/ML en Production

### Monitoring et Logging

```python
import logging
from datetime import datetime

class AILogger:
    """Logger spécialisé pour les systèmes AI/ML."""
    
    def __init__(self, log_file: str = "ai_operations.log"):
        self.logger = logging.getLogger("AI_ML")
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log_query(self, query: str, model: str):
        """Log une requête."""
        self.logger.info(f"Query: {query[:100]}... | Model: {model}")
    
    def log_retrieval(self, query: str, num_docs: int, avg_score: float):
        """Log la récupération."""
        self.logger.info(f"Retrieved {num_docs} docs | Avg score: {avg_score:.3f}")
    
    def log_generation(self, answer: str, latency_ms: float):
        """Log la génération."""
        self.logger.info(f"Generated answer | Latency: {latency_ms:.0f}ms")
    
    def log_error(self, error: Exception, context: str):
        """Log les erreurs."""
        self.logger.error(f"Error in {context}: {str(error)}")
    
    def log_performance(self, metric: str, value: float):
        """Log les métriques de performance."""
        self.logger.info(f"Metric {metric}: {value:.3f}")
```

### Caching d'Embeddings

```python
from functools import lru_cache
import json

class EmbeddingCache:
    """Cache persistant pour les embeddings."""
    
    def __init__(self, cache_file: str = "embeddings_cache.json"):
        self.cache_file = cache_file
        self.memory = self._load_cache()
    
    def _load_cache(self) -> dict:
        try:
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def _save_cache(self):
        with open(self.cache_file, 'w') as f:
            json.dump(self.memory, f)
    
    def get(self, text: str) -> List[float] | None:
        """Récupère un embedding du cache."""
        key = hash(text)
        return self.memory.get(str(key))
    
    def set(self, text: str, embedding: List[float]):
        """Sauvegarde un embedding."""
        key = hash(text)
        self.memory[str(key)] = embedding
        self._save_cache()
    
    def clear(self):
        """Vide le cache."""
        self.memory = {}
        self._save_cache()
```

---

## ✅ Checklist AI/ML

- [ ] Qdrant configuré et accessible ✅
- [ ] Modèle d'embedding sélectionné ✅
- [ ] Collections Qdrant créées ✅
- [ ] RAG pipeline implémenté ✅
- [ ] Evaluation metrics en place ✅
- [ ] Fine-tuning possible ✅
- [ ] Logging et monitoring actifs ✅
- [ ] Cache d'embeddings en place ✅
- [ ] Gestion des erreurs robuste ✅
- [ ] Documentation du domaine complète ✅

---

**📌 Note**: Qdrant est le cœur de la mémoire AI/ML Darkmedia-X. Tous les projets doivent l'utiliser pour la cohérence.
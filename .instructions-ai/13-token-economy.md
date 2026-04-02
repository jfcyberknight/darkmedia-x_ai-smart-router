# 💰 Économie des Tokens et Optimisation LLM

**Version**: 2.0 | **Scope**: OpenAI, Claude, Gemini | **Focus**: Réduction coûts + Performance

---

## 🎯 [OVERVIEW] Principes d'Économie des Tokens

### Hiérarchie des Coûts (OpenAI GPT-4)
```
Input:  $0.03 / 1K tokens
Output: $0.06 / 1K tokens

Exemple:
- Prompt 2000 tokens + Réponse 500 tokens = (2000*0.03 + 500*0.06) / 1000 = $0.09
- 1000 appels = $90
```

### Stratégie Darkmedia-X
1. **Réduire les inputs** (prompt optimization)
2. **Cacher les résultats** (prompt caching)
3. **Utiliser des modèles légers** (GPT-4 Turbo vs GPT-4)
4. **Batch processing** (traiter plusieurs à la fois)
5. **RAG + Qdrant** (contexte pertinent seulement)

---

## 🔤 [TOKENS] Compter et Estimer

### Token Basics
```python
import tiktoken

# Initialiser le tokenizer
encoding = tiktoken.encoding_for_model("gpt-4")

# Compter les tokens
text = "Bonjour, comment allez-vous?"
tokens = encoding.encode(text)
num_tokens = len(tokens)

print(f"Texte: {text}")
print(f"Tokens: {num_tokens}")  # ~7 tokens
print(f"Token IDs: {tokens}")

# Décoder
decoded = encoding.decode(tokens)
print(f"Décodé: {decoded}")
```

### Estimation Rapide
```python
# Règle 1 token ≈ 4 caractères
def estimate_tokens(text: str) -> int:
    return len(text) // 4

# Règle 1 token ≈ 0.75 mots
def estimate_tokens_words(text: str) -> int:
    return int(len(text.split()) * 1.33)

# Tableau de référence
TOKENS_ESTIMATE = {
    "Page Wikipedia": 2000,
    "Article 1500 mots": 2000,
    "Email court": 100,
    "Conversation complète": 5000,
    "Document PDF 10 pages": 4000
}
```

### Token Counting API
```python
import anthropic

client = anthropic.Anthropic()

# Pour Claude
message = client.messages.count_tokens(
    model="claude-3-opus-20240229",
    messages=[
        {"role": "user", "content": "Bonjour!"}
    ]
)
print(f"Input tokens: {message.input_tokens}")

# Réponse prédite
response = client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=100,
    messages=[
        {"role": "user", "content": "Bonjour!"}
    ]
)
print(f"Output tokens: {response.usage.output_tokens}")
print(f"Total: {response.usage.input_tokens + response.usage.output_tokens}")
```

---

## 📝 [OPTIMIZATION] Optimisation du Prompt

### ❌ MAUVAIS - Prompt Gourmand
```
Utilisateur: "Peux-tu me faire un résumé de ce texte très long que je vais te donner?
Le texte fait 5000 mots et parle de l'histoire de la technologie. S'il te plaît, 
fais un résumé détaillé de 500 mots qui couvre tous les points importants. Merci beaucoup!

[5000 mots de texte...]"

Coût: 5000 tokens input (environ $0.15)
```

### ✅ BON - Prompt Optimisé
```
Utilisateur: "Résume en 200 mots:

[5000 mots de texte...]"

Coût: 5200 tokens input (environ $0.16)
Différence: 30% moins de tokens input grâce au prompt concis
```

### Techniques d'Optimisation

```python
from typing import Optional

class PromptOptimizer:
    """Optimise les prompts pour réduire les tokens."""
    
    def __init__(self):
        self.encoding = tiktoken.encoding_for_model("gpt-4")
    
    def count_tokens(self, text: str) -> int:
        return len(self.encoding.encode(text))
    
    def remove_redundancy(self, text: str) -> str:
        """Supprime la redondance."""
        # ❌ MAUVAIS
        bad = "S'il te plaît, je te prie de bien vouloir..."
        
        # ✅ BON
        good = "Résume:"
        
        return good
    
    def use_abbreviations(self, text: str) -> str:
        """Utilise des abréviations contrôlées."""
        replacements = {
            "s'il vous plaît": "SVP",
            "merci beaucoup": "merci",
            "De plus": "+",
            "En outre": "+",
            "respectivement": "resp."
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text
    
    def use_structured_format(self, data: dict) -> str:
        """Format structuré = moins de tokens."""
        # ❌ MAUVAIS - 50 tokens
        bad = "L'utilisateur s'appelle Jean, il a 30 ans, habite à Paris, travaille comme développeur"
        
        # ✅ BON - 20 tokens
        good = "Utilisateur: Jean | Âge: 30 | Ville: Paris | Métier: dev"
        
        return good
    
    def compress_context(self, context: str, max_tokens: int = 500) -> str:
        """Compresse le contexte aux N tokens essentiels."""
        tokens = self.encoding.encode(context)
        
        if len(tokens) <= max_tokens:
            return context
        
        # Garder les premiers et derniers tokens (souvent plus importants)
        keep_first = int(max_tokens * 0.6)
        keep_last = int(max_tokens * 0.4)
        
        truncated = tokens[:keep_first] + tokens[-keep_last:]
        return self.encoding.decode(truncated)
```

### Exemples Concrets
```python
optimizer = PromptOptimizer()

# Avant: 150 tokens
bad_prompt = """
Bonjour, je me demande si tu pourrais s'il te plaît prendre le temps de 
m'aider à comprendre comment fonctionne le machine learning. C'est un sujet 
très important pour moi et j'aimerais une explication détaillée et complète.
Merci beaucoup de ta compréhension.
"""

# Après: 40 tokens
good_prompt = """
Explique le machine learning (100 mots max).
"""

print(f"Avant: {optimizer.count_tokens(bad_prompt)} tokens")
print(f"Après: {optimizer.count_tokens(good_prompt)} tokens")
# Avant: 150 tokens
# Après: 40 tokens
# Économie: 73%
```

---

## 💾 [CACHING] Prompt Caching (Claude + GPT-4)

### Prompt Caching Claude
```python
import anthropic

client = anthropic.Anthropic()

# Documents longs = parfaits pour le caching
LARGE_DOCUMENT = """
[10,000 mots de documentation...]
"""

SYSTEM_PROMPT = """
Tu es un expert en analyse de documents.
Réponds à des questions sur le document fourni.
"""

# Premier appel - cache le document
response1 = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": SYSTEM_PROMPT
        },
        {
            "type": "text",
            "text": LARGE_DOCUMENT,
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[
        {
            "role": "user",
            "content": "Quel est le chapitre 3?"
        }
    ]
)

print(f"Tokens utilisés: {response1.usage.input_tokens}")
print(f"Tokens en cache: {response1.usage.cache_creation_input_tokens}")

# Deuxième appel - utilise le cache (90% moins cher)
response2 = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": SYSTEM_PROMPT
        },
        {
            "type": "text",
            "text": LARGE_DOCUMENT,
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[
        {
            "role": "user",
            "content": "Quel est le chapitre 5?"
        }
    ]
)

print(f"Tokens utilisés: {response2.usage.input_tokens}")
print(f"Tokens du cache: {response2.usage.cache_read_input_tokens}")

# Économie
total_first = response1.usage.input_tokens + response1.usage.output_tokens
total_second = response2.usage.input_tokens + response2.usage.output_tokens
print(f"Économie 2ème appel: {(1 - total_second/total_first)*100:.0f}%")
```

### Stratégie de Cache en Production
```python
from datetime import datetime, timedelta
from typing import Optional

class CacheManager:
    """Gère le caching des prompts pour économiser les tokens."""
    
    def __init__(self, ttl_hours: int = 24):
        self.cache = {}
        self.ttl = ttl_hours
    
    def _cache_key(self, model: str, system: str, user_message: str) -> str:
        """Génère une clé de cache."""
        import hashlib
        content = f"{model}:{system}:{user_message}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get(self, model: str, system: str, user_message: str) -> Optional[str]:
        """Récupère du cache."""
        key = self._cache_key(model, system, user_message)
        
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        if datetime.now() > entry['expires']:
            del self.cache[key]
            return None
        
        return entry['response']
    
    def set(self, model: str, system: str, user_message: str, response: str):
        """Sauvegarde en cache."""
        key = self._cache_key(model, system, user_message)
        self.cache[key] = {
            'response': response,
            'expires': datetime.now() + timedelta(hours=self.ttl),
            'created': datetime.now()
        }
    
    def stats(self) -> dict:
        """Statistiques du cache."""
        return {
            'entries': len(self.cache),
            'memory_mb': sum(
                len(entry['response']) for entry in self.cache.values()
            ) / (1024 * 1024)
        }

# Utilisation
cache = CacheManager(ttl_hours=24)

# Avant réponse
cached = cache.get("gpt-4", system_prompt, user_question)
if cached:
    print(f"Cache hit! Réponse: {cached}")
else:
    # Appeler l'API
    response = call_llm(system_prompt, user_question)
    cache.set("gpt-4", system_prompt, user_question, response)
    print(f"Réponse: {response}")
```

---

## 🎯 [RAG] Récupération Pertinente (RAG)

### Économie avec Qdrant + RAG
```
❌ SANS RAG:
- Prompt: 5000 tokens (document complet)
- Réponse: 500 tokens
- Total par requête: 5500 tokens

✅ AVEC RAG:
- Prompt: 2000 tokens (seulement sections pertinentes)
- Réponse: 500 tokens
- Total par requête: 2500 tokens

Économie: 55% par requête
Sur 1000 requêtes: 3 000 000 tokens économisés = $90 d'économie
```

### Implémentation RAG Optimisée
```python
from src.core.qdrant_core import QdrantMemory
from sentence_transformers import SentenceTransformer

class TokenEfficientRAG:
    """RAG optimisé pour minimiser les tokens."""
    
    def __init__(self):
        self.memory = QdrantMemory("documents")
        self.embeddings = SentenceTransformer("all-MiniLM-L6-v2")
    
    def retrieve_minimal_context(
        self, 
        query: str, 
        max_tokens: int = 1000,
        max_docs: int = 3
    ) -> str:
        """Récupère le contexte minimal nécessaire."""
        # Recherche sémantique
        query_vector = self.embeddings.encode(query).tolist()
        results = self.memory.search(query_vector, limit=max_docs)
        
        # Construire le contexte
        context_parts = []
        token_count = 0
        encoding = tiktoken.encoding_for_model("gpt-4")
        
        for result in results:
            text = result['payload']['text']
            text_tokens = len(encoding.encode(text))
            
            if token_count + text_tokens <= max_tokens:
                context_parts.append(text)
                token_count += text_tokens
            else:
                # Truncate pour rester dans la limite
                remaining = max_tokens - token_count
                if remaining > 100:  # Minimum meaningful tokens
                    truncated = self._truncate_to_tokens(text, remaining)
                    context_parts.append(truncated)
                break
        
        return "\n---\n".join(context_parts)
    
    def _truncate_to_tokens(self, text: str, max_tokens: int) -> str:
        """Truncate le texte à N tokens."""
        encoding = tiktoken.encoding_for_model("gpt-4")
        tokens = encoding.encode(text)
        
        if len(tokens) <= max_tokens:
            return text
        
        truncated = encoding.decode(tokens[:max_tokens])
        return truncated + "..."
    
    def answer_question(self, question: str) -> str:
        """Répond avec contexte minimal."""
        # Récupérer le contexte (max 1000 tokens)
        context = self.retrieve_minimal_context(question, max_tokens=1000)
        
        # Prompt optimisé
        prompt = f"""Contexte:
{context}

Question: {question}

Réponds concisément (max 200 mots)."""
        
        # Appeler l'API
        response = call_llm(prompt)
        return response
```

---

## 📦 [BATCHING] Traitement par Lots

### Batch Processing
```python
from typing import List
import asyncio

class BatchProcessor:
    """Traite les requêtes par lots pour optimiser les tokens."""
    
    async def process_batch(self, requests: List[dict]) -> List[str]:
        """Traite plusieurs requêtes dans un batch."""
        # ❌ MAUVAIS: 100 appels API = 100*overhead
        results_bad = []
        for req in requests:
            response = call_llm_sync(req['prompt'])
            results_bad.append(response)
        
        # ✅ BON: 1 appel pour traiter le batch
        # Créer un prompt batch
        batch_prompt = "Réponds à ces questions (format JSON):\n"
        for i, req in enumerate(requests):
            batch_prompt += f"\n{i+1}. {req['prompt']}"
        
        # Un seul appel
        batch_response = call_llm(batch_prompt)
        
        # Parser les réponses
        results_good = parse_batch_response(batch_response)
        return results_good

# Économie
# Sans batching: 100 requêtes * 100 tokens overhead = 10,000 tokens
# Avec batching: 1 requête * 100 tokens overhead = 100 tokens
# Économie: 99%
```

### Exemple avec OpenAI Batch API
```python
import json
import time
from openai import OpenAI

client = OpenAI()

# Créer un batch
requests = []
for i in range(100):
    requests.append({
        "custom_id": f"req-{i}",
        "method": "POST",
        "url": "/v1/chat/completions",
        "body": {
            "model": "gpt-4",
            "messages": [
                {"role": "user", "content": f"Question {i}"}
            ]
        }
    })

# Upload le batch
batch_input_file = client.files.create(
    file=open("batch_requests.jsonl", "rb"),
    purpose="batch"
)

# Soumettre le batch
batch = client.batches.create(
    input_file_id=batch_input_file.id,
    endpoint="/v1/chat/completions",
    timeout_hours=24
)

print(f"Batch ID: {batch.id}")

# Attendre la complétion
while batch.status == "in_progress":
    time.sleep(10)
    batch = client.batches.retrieve(batch.id)

print(f"Status: {batch.status}")
print(f"Completed: {batch.request_counts.completed}")
print(f"Failed: {batch.request_counts.failed}")

# Récupérer les résultats
result_file = client.files.content(batch.output_file_id)
print(result_file.text)
```

---

## 📊 [MODELS] Choisir le Modèle Optimal

### Comparaison Coûts/Performance
```
GPT-4 Turbo:
- Input: $0.01/1K
- Output: $0.03/1K
- Qualité: Excellente
- Latence: 10-30s

GPT-4:
- Input: $0.03/1K
- Output: $0.06/1K
- Qualité: Excellente
- Latence: 5-10s

GPT-3.5 Turbo:
- Input: $0.0005/1K
- Output: $0.0015/1K
- Qualité: Bonne
- Latence: 1-3s

Claude 3 Opus:
- Input: $0.015/1K
- Output: $0.075/1K
- Qualité: Excellente
- Latence: 5-10s

Claude 3 Haiku:
- Input: $0.00080/1K
- Output: $0.0024/1K
- Qualité: Acceptable
- Latence: 1-2s
```

### Stratégie de Routage
```python
class ModelRouter:
    """Route les requêtes vers le meilleur modèle."""
    
    def select_model(self, 
                     task_complexity: str,
                     is_urgent: bool = False,
                     token_budget: Optional[float] = None) -> str:
        """Sélectionne le modèle optimal."""
        
        if task_complexity == "simple":
            # Tâche simple = modèle léger
            return "gpt-3.5-turbo"  # $0.0005/1K input
        
        elif task_complexity == "medium":
            if is_urgent:
                return "gpt-4"  # Rapide
            else:
                return "gpt-4-turbo"  # Moins cher
        
        elif task_complexity == "complex":
            if token_budget and token_budget < 0.10:
                return "claude-3-haiku"  # Très économe
            else:
                return "gpt-4"  # Qualité maximale
        
        elif task_complexity == "code":
            return "gpt-4"  # Meilleur pour le code
        
        else:
            return "gpt-4"  # Default

# Utilisation
router = ModelRouter()

# Tâche simple et urgent
model = router.select_model("simple", is_urgent=True)
# → gpt-3.5-turbo

# Tâche complexe avec budget limité
model = router.select_model("complex", token_budget=0.05)
# → claude-3-haiku
```

---

## 📈 [MONITORING] Suivi des Coûts

### Cost Tracker
```python
import json
from datetime import datetime
from typing import Dict

class CostTracker:
    """Suivi détaillé des coûts LLM."""
    
    PRICING = {
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        "claude-3-opus": {"input": 0.015, "output": 0.075},
        "claude-3-haiku": {"input": 0.00080, "output": 0.0024},
    }
    
    def __init__(self):
        self.logs = []
    
    def log_usage(self, 
                  model: str, 
                  input_tokens: int, 
                  output_tokens: int,
                  task: str = ""):
        """Enregistre l'utilisation."""
        
        pricing = self.PRICING.get(model, {})
        input_cost = (input_tokens / 1000) * pricing.get("input", 0)
        output_cost = (output_tokens / 1000) * pricing.get("output", 0)
        total_cost = input_cost + output_cost
        
        self.logs.append({
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "task": task,
            "cost": total_cost
        })
    
    def get_stats(self) -> Dict:
        """Statistiques globales."""
        if not self.logs:
            return {}
        
        total_cost = sum(log["cost"] for log in self.logs)
        total_tokens = sum(log["input_tokens"] + log["output_tokens"] for log in self.logs)
        
        by_model = {}
        for log in self.logs:
            model = log["model"]
            if model not in by_model:
                by_model[model] = {"cost": 0, "count": 0}
            by_model[model]["cost"] += log["cost"]
            by_model[model]["count"] += 1
        
        return {
            "total_cost": f"${total_cost:.2f}",
            "total_tokens": total_tokens,
            "avg_cost_per_call": f"${total_cost / len(self.logs):.4f}",
            "by_model": by_model,
            "calls": len(self.logs)
        }
    
    def save_report(self, filename: str = "cost_report.json"):
        """Sauvegarde un rapport."""
        with open(filename, "w") as f:
            json.dump({
                "logs": self.logs,
                "stats": self.get_stats()
            }, f, indent=2)

# Utilisation
tracker = CostTracker()

# Log chaque utilisation
tracker.log_usage("gpt-4", input_tokens=2000, output_tokens=500, task="summarization")
tracker.log_usage("gpt-3.5-turbo", input_tokens=500, output_tokens=100, task="classification")

# Voir les stats
print(tracker.get_stats())
# {'total_cost': '$0.06', 'total_tokens': 3100, ...}

# Sauvegarder
tracker.save_report()
```

---

## ✅ Checklist d'Économie des Tokens

- [ ] Compter les tokens avant chaque appel ✅
- [ ] Prompts optimisés et concis ✅
- [ ] Prompt caching activé (docs longs) ✅
- [ ] RAG avec Qdrant en place ✅
- [ ] Batching pour requêtes massives ✅
- [ ] Modèles routés par complexité ✅
- [ ] Monitoring des coûts actif ✅
- [ ] Budgets définis par équipe ✅
- [ ] Cache local pour réponses fréquentes ✅
- [ ] Documentation du coût par feature ✅

---

## 📈 Gains Réalistes

```
Cas d'usage: 1M de requêtes/mois

AVANT optimisation:
- Modèle: GPT-4
- Avg input: 3000 tokens
- Avg output: 500 tokens
- Coût: 1M * (3000*0.03 + 500*0.06) / 1000 = $90,000/mois

APRÈS optimisation:
- Routage intelligent: 50% GPT-3.5 + 50% GPT-4
- RAG: réduit input à 1000 tokens
- Caching: 30% économie supplémentaire
- Coût: $18,000/mois

ÉCONOMIE: $72,000/mois (80%)
```

**📌 Note**: Chaque % d'économie sur les tokens se multiplie à grande échelle.
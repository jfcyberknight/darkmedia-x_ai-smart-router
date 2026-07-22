import os
import glob
import uuid
import requests
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer

# Configuration lue depuis l'environnement (JAMAIS de secret committé).
# Renseigner QDRANT_URL et QDRANT_API_KEY dans le .env (ou l'environnement CI).
QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "knowledge_base")
MODEL_NAME = "all-MiniLM-L6-v2" # 384 dimensions, standard

def init_qdrant():
    if not QDRANT_URL or not QDRANT_API_KEY:
        raise RuntimeError(
            "QDRANT_URL et QDRANT_API_KEY doivent etre definis dans l'environnement "
            "(.env). Aucun secret n'est stocke dans le code."
        )
    print(f"Connexion a Qdrant: {QDRANT_URL}")
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    
    # Verifier si la collection existe
    collections = client.get_collections().collections
    exists = any(c.name == COLLECTION_NAME for c in collections)
    
    if not exists:
        print(f"Creation de la collection: {COLLECTION_NAME}")
        client.recreate_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
        )
    else:
        print(f"Collection existante trouvee: {COLLECTION_NAME}")
        
    return client

def load_model():
    print(f"Chargement du modele d'embeddings: {MODEL_NAME}")
    return SentenceTransformer(MODEL_NAME)

def index_files(client, model, directory=".instructions-ai"):
    print(f"Indexation des fichiers dans: {directory}")
    files = glob.glob(os.path.join(directory, "*.md"))
    
    points = []
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            filename = os.path.basename(file_path)
            
            # On pourrait decouper en chunks ici, mais pour des instructions on prend le fichier entier
            # ou on decoupe par section si necessaire.
            
            print(f"Traitement de: {filename}")
            embedding = model.encode(content).tolist()
            
            points.append(models.PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "filename": filename,
                    "path": file_path,
                    "content": content,
                    "project": "darkmedia-x_api-ai-smart-router"
                }
            ))

    if points:
        print(f"Envoi de {len(points)} points vers Qdrant...")
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print("Indexation terminee avec succes.")
    else:
        print("Aucun fichier .md trouve a indexer.")

if __name__ == "__main__":
    try:
        q_client = init_qdrant()
        transformer = load_model()
        index_files(q_client, transformer)
    except Exception as e:
        print(f"Erreur lors de l'indexation: {e}")

# rag/retriever.py

from .embedding import generate_embedding
from .knowledge_store import KnowledgeStore

class Retriever:
    def __init__(self):
        self.store = KnowledgeStore()

    def retrieve(self, query, k=5):
        embedding = generate_embedding(query)
        return self.store.search(embedding, k=k)

# rag/knowledge_store.py

import numpy as np
import faiss
import os
import json

class KnowledgeStore:
    def __init__(self, index_path="vector_store.index", meta_path="metadata.json"):
        self.index_path = index_path
        self.meta_path = meta_path

        self.index = None
        self.metadata = []

        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)

        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)

    def build(self, embeddings, metadata):
        vectors = np.array(embeddings).astype("float32")
        dimension = vectors.shape[1]

        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(vectors)

        with open(self.meta_path, "w") as f:
            json.dump(metadata, f, indent=4)

        faiss.write_index(self.index, self.index_path)

    def search(self, query_vector, k=5):
        distances, indices = self.index.search(
            np.array([query_vector]).astype("float32"),
            k
        )
        results = []
        for idx in indices[0]:
            results.append(self.metadata[idx])

        return results

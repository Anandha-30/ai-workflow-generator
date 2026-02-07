import os
def load_documents_from_directory(directory_path):
    docs[]
    for root, _, files in os.walk(dataset_path):
        for f in files:
            if f.endswith(".txt"):
                full_path = os.path.join(root, f)
                with open(full_path, "r", encoding="utf-8") as file:
                    docs.append({
                        "id": f,
                        "path": full_path,
                        "content": file.read()
                    })

    return docs

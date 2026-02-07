
def chunk_text(text, chunk_size=400, overlap=100):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        chunks.append(chunk)
        start = end - overlap  # overlap

        if start < 0:
            start = 0

    return chunks

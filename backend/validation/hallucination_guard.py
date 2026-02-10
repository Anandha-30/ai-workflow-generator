# validation/hallucination_guard.py

def detect_hallucination(workflow, context_docs):
    context_text = " ".join([doc["content"].lower() for doc in context_docs])
    hallucinations = []

    for step in workflow["steps"]:
        if step["text"].lower() not in context_text:
            hallucinations.append(step["text"])

    return hallucinations

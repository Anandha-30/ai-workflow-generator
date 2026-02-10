# llm/prompt_templates.py

def workflow_prompt(user_query, context_docs):
    context = "\n".join([doc["content"] for doc in context_docs])

    return f"""
Use ONLY the information in the context below to generate a workflow.
If something is not supported by context, DO NOT hallucinate.

Context:
{context}

User Request:
{user_query}

Return JSON:
{{
  "steps": [
    {{"id": "1", "text": "Step description"}}
  ],
  "links": [
    {{"from": "1", "to": "2"}}
  ]
}}
"""

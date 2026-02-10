# llm/llm_client.py

import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_llm(prompt):
    res = client.responses.create(
        model="gpt-4.1",
        input=prompt
    )
    return res.output_text

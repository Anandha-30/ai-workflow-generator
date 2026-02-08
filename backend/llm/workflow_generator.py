# llm/workflow_generator.py

from .prompt_templates import workflow_prompt
from .llm_client import call_llm
from rag.retriever import Retriever
import json

class WorkflowGenerator:
    def __init__(self):
        self.retriever = Retriever()

    def generate(self, user_query):
        # retrieve relevant docs
        docs = self.retriever.retrieve(user_query)

        # build prompt
        prompt = workflow_prompt(user_query, docs)

        # call LLM
        output = call_llm(prompt)

        # parse JSON
        try:
            return json.loads(output)
        except:
            return {"error": "Invalid JSON from model", "raw": output}

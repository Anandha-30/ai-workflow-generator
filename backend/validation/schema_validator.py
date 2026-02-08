# validation/schema_validator.py

import jsonschema

workflow_schema = {
    "type": "object",
    "properties": {
        "steps": {"type": "array"},
        "links": {"type": "array"}
    },
    "required": ["steps", "links"]
}

def validate_schema(data):
    try:
        jsonschema.validate(data, workflow_schema)
        return True, None
    except jsonschema.ValidationError as e:
        return False, str(e)

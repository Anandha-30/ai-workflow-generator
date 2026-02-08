# validation/logical_validator.py

def validate_logic(workflow):
    step_ids = {step["id"] for step in workflow["steps"]}

    for link in workflow["links"]:
        if link["from"] not in step_ids or link["to"] not in step_ids:
            return False, f"Invalid link: {link}"

    return True, None

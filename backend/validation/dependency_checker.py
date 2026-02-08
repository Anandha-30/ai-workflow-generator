# validation/dependency_checker.py

def check_dependencies(workflow):
    graph = {step["id"]: [] for step in workflow["steps"]}

    for link in workflow["links"]:
        graph[link["from"]].append(link["to"])

    visited = set()

    def dfs(node, stack):
        if node in stack:
            return True
        stack.add(node)

        for nxt in graph[node]:
            if dfs(nxt, stack):
                return True

        stack.remove(node)
        return False

    for n in graph:
        if dfs(n, set()):
            return False, "Circular dependency detected"

    return True, None

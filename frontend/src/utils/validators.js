export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function validatePrompt(prompt) {
  const text = String(prompt || "").trim();

  if (!text) {
    return { ok: false, message: "Prompt is empty. Add your workflow or system description." };
  }

  if (text.length < 8) {
    return { ok: false, message: "Prompt is too short. Use at least 8 characters." };
  }

  if (text.length > 4000) {
    return { ok: false, message: "Prompt exceeds 4000 characters." };
  }

  return { ok: true };
}

export function assertDiagramModel(model) {
  if (!model || typeof model !== "object") {
    throw new Error("Invalid diagram payload.");
  }

  if (!Array.isArray(model.nodes) || !Array.isArray(model.edges)) {
    throw new Error("Diagram payload requires nodes and edges arrays.");
  }

  for (const node of model.nodes) {
    if (!node || typeof node !== "object") throw new Error("Invalid node payload.");
    if (!node.id || !node.type || !node.label) {
      throw new Error("Node requires id, type, and label.");
    }
    if (typeof node.x !== "number" || typeof node.y !== "number") {
      throw new Error("Node requires numeric x and y positions.");
    }
  }

  for (const edge of model.edges) {
    if (!edge || typeof edge !== "object") throw new Error("Invalid edge payload.");
    if (!edge.id || !edge.from || !edge.to) {
      throw new Error("Edge requires id, from, and to.");
    }
  }

  return model;
}

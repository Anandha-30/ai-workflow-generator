import { assertDiagramModel, validatePrompt } from "./validators.js";

const NODE_GAP_X = 260;
const NODE_GAP_Y = 150;
const DEFAULT_TIMEOUT_MS = 25000;

export async function generateDiagramModel({ prompt, kind }) {
  const check = validatePrompt(prompt);
  if (!check.ok) throw new Error(check.message);

  const endpoint = String(import.meta?.env?.VITE_DIAGRAM_API_URL || "").trim();
  if (!endpoint) {
    throw new Error(
      "Backend not connected. Set VITE_DIAGRAM_API_URL in frontend/.env and restart the app."
    );
  }

  const timeoutMs = getTimeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, kind }),
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = await safeReadText(response);
      const suffix = detail ? `: ${detail}` : "";
      throw new Error(`Backend returned ${response.status}${suffix}`);
    }

    const payload = await response.json();
    const normalized = normalizeDiagramPayload(payload, kind);
    const model = assertDiagramModel(normalized);

    if (hasNodePositions(model.nodes)) {
      return {
        kind,
        nodes: model.nodes.map((node) => ({ ...node, ...getNodeSize(node) })),
        edges: model.edges
      };
    }

    return autoLayout({ kind, nodes: model.nodes, edges: model.edges });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Backend timeout after ${timeoutMs}ms. Check API latency.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function autoLayout({ kind, nodes, edges }) {
  if (!nodes.length) return { kind, nodes, edges };
  return kind === "blueprint" ? layoutBlueprint(nodes, edges) : layoutLinearFlow(nodes, edges);
}

function layoutLinearFlow(nodes, edges) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visited = new Set();
  const ordered = [];
  const start = nodes.find((node) => node.type === "start") || nodes[0];

  function walk(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    ordered.push(nodeId);

    for (const edge of edges) {
      if (edge.from === nodeId) walk(edge.to);
    }
  }

  walk(start.id);
  for (const node of nodes) {
    if (!visited.has(node.id)) ordered.push(node.id);
  }

  const laidOut = ordered.map((id, index) => {
    const node = byId.get(id);
    return {
      ...node,
      ...getNodeSize(node),
      x: 0,
      y: index * NODE_GAP_Y
    };
  });

  return centerLayout(laidOut, edges);
}

function layoutBlueprint(nodes, edges) {
  const laidOut = nodes.map((node) => ({ ...node, ...getNodeSize(node) }));
  const groups = {
    client: [],
    edge: [],
    service: [],
    data: []
  };

  for (const node of laidOut) {
    const text = String(node.label || "").toLowerCase();
    if (text.includes("client") || text.includes("frontend") || text.includes("web")) {
      groups.client.push(node);
    } else if (text.includes("api") || text.includes("gateway") || text.includes("edge")) {
      groups.edge.push(node);
    } else if (
      text.includes("service") ||
      text.includes("worker") ||
      text.includes("auth") ||
      text.includes("queue")
    ) {
      groups.service.push(node);
    } else {
      groups.data.push(node);
    }
  }

  const columns = Object.values(groups).filter((column) => column.length > 0);
  columns.forEach((column, columnIndex) => {
    column.forEach((node, rowIndex) => {
      node.x = columnIndex * NODE_GAP_X;
      node.y = rowIndex * (NODE_GAP_Y - 22);
    });
  });

  return centerLayout(laidOut, edges);
}

function normalizeDiagramPayload(payload, requestedKind) {
  const root = pickPayloadRoot(payload);
  const rawNodes = findNodes(root);
  const rawEdges = findEdges(root);

  if (!Array.isArray(rawNodes) || rawNodes.length === 0) {
    throw new Error("Backend payload missing nodes.");
  }

  const nodes = rawNodes.map((rawNode, index) => {
    const id = String(
      rawNode?.id ??
        rawNode?.nodeId ??
        rawNode?.key ??
        rawNode?.name ??
        `node_${index + 1}`
    );

    const rawType = String(
      rawNode?.type ?? rawNode?.kind ?? rawNode?.nodeType ?? rawNode?.role ?? "process"
    );
    const type = normalizeNodeType(rawType, requestedKind);
    const label = String(
      rawNode?.label ??
        rawNode?.title ??
        rawNode?.name ??
        rawNode?.text ??
        rawNode?.description ??
        `Step ${index + 1}`
    );

    return {
      id,
      type,
      label,
      x: toFiniteNumber(rawNode?.x, 0),
      y: toFiniteNumber(rawNode?.y, 0),
      width: toFiniteNumber(rawNode?.width, undefined),
      height: toFiniteNumber(rawNode?.height, undefined)
    };
  });

  const nodeIdSet = new Set(nodes.map((node) => node.id));
  const edges = Array.isArray(rawEdges)
    ? rawEdges
        .map((rawEdge, index) => {
          const from = readEdgeRef(rawEdge, "from");
          const to = readEdgeRef(rawEdge, "to");
          if (!from || !to) return null;
          if (!nodeIdSet.has(from) || !nodeIdSet.has(to)) return null;

          return {
            id: String(rawEdge?.id ?? rawEdge?.edgeId ?? `edge_${index + 1}`),
            from,
            to
          };
        })
        .filter(Boolean)
    : [];

  const finalEdges = edges.length > 0 ? edges : createSequentialEdges(nodes);
  return { kind: requestedKind, nodes, edges: finalEdges };
}

function pickPayloadRoot(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Backend payload is not a JSON object.");
  }

  const candidates = [
    payload,
    payload.data,
    payload.result,
    payload.diagram,
    payload.workflow
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    if (Array.isArray(candidate.nodes) || Array.isArray(candidate.vertices) || Array.isArray(candidate.steps)) {
      return candidate;
    }
  }

  return payload;
}

function findNodes(root) {
  if (!root || typeof root !== "object") return [];
  if (Array.isArray(root.nodes)) return root.nodes;
  if (Array.isArray(root.vertices)) return root.vertices;
  if (Array.isArray(root.steps)) return root.steps;
  if (Array.isArray(root.items)) return root.items;
  return [];
}

function findEdges(root) {
  if (!root || typeof root !== "object") return [];
  if (Array.isArray(root.edges)) return root.edges;
  if (Array.isArray(root.links)) return root.links;
  if (Array.isArray(root.connections)) return root.connections;
  return [];
}

function normalizeNodeType(rawType, kind) {
  const value = String(rawType || "").trim().toLowerCase();

  if (value === "start" || value === "entry" || value === "begin") return "start";
  if (value === "end" || value === "finish" || value === "stop" || value === "exit") return "end";
  if (value === "decision" || value === "condition" || value === "branch") {
    return kind === "blueprint" ? "blueprintDecision" : "decision";
  }
  if (value === "blueprint" || value === "component" || value === "service") return "blueprint";
  if (value === "blueprintdecision") return "blueprintDecision";

  return kind === "blueprint" ? "blueprint" : "process";
}

function readEdgeRef(edge, side) {
  if (!edge || typeof edge !== "object") return "";
  const sourceKeys =
    side === "from"
      ? ["from", "source", "fromId", "start", "parent", "u"]
      : ["to", "target", "toId", "end", "child", "v"];

  for (const key of sourceKeys) {
    const value = edge[key];
    if (value === null || value === undefined) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

function createSequentialEdges(nodes) {
  const edges = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    edges.push({
      id: `edge_${index + 1}`,
      from: nodes[index].id,
      to: nodes[index + 1].id
    });
  }
  return edges;
}

function hasNodePositions(nodes) {
  return nodes.some((node) => Number.isFinite(node.x) && Number.isFinite(node.y) && (node.x !== 0 || node.y !== 0));
}

function centerLayout(nodes, edges) {
  const bounds = computeBounds(nodes);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return {
    nodes: nodes.map((node) => ({ ...node, x: node.x - centerX, y: node.y - centerY })),
    edges
  };
}

function getNodeSize(node) {
  const text = String(node.label || "");
  const isDecision = node.type === "decision" || node.type === "blueprintDecision";
  const minWidth = isDecision ? 170 : node.type === "blueprint" ? 260 : 200;
  const width = Math.min(390, Math.max(minWidth, 130 + text.length * 7));
  const height = isDecision ? 122 : node.type === "blueprint" ? 120 : 88;
  return { width, height };
}

function getTimeoutMs() {
  const raw = Number(import.meta?.env?.VITE_DIAGRAM_API_TIMEOUT_MS);
  if (!Number.isFinite(raw) || raw < 1000) return DEFAULT_TIMEOUT_MS;
  return raw;
}

async function safeReadText(response) {
  try {
    const text = await response.text();
    return String(text || "").trim().slice(0, 240);
  } catch {
    return "";
  }
}

function toFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function computeBounds(nodes) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const width = node.width || 0;
    const height = node.height || 0;

    minX = Math.min(minX, node.x - width / 2);
    minY = Math.min(minY, node.y - height / 2);
    maxX = Math.max(maxX, node.x + width / 2);
    maxY = Math.max(maxY, node.y + height / 2);
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  return { minX, minY, maxX, maxY };
}


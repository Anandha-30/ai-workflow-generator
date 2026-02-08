import { computeBounds } from "./layoutEngine.js";

export function downloadDiagramJSON(snapshot) {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...snapshot
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  downloadBlob(blob, `diagram-${stamp()}.json`);
}

export function downloadDiagramSVG(snapshot) {
  const { svg, width, height } = buildDiagramSVG(snapshot, { padding: 80 });
  const blob = new Blob([svg], {
    type: "image/svg+xml;charset=utf-8"
  });

  downloadBlob(blob, `diagram-${stamp()}-${Math.round(width)}x${Math.round(height)}.svg`);
}

export async function downloadDiagramPNG(snapshot) {
  const { svg, width, height } = buildDiagramSVG(snapshot, { padding: 120 });
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width);
    canvas.height = Math.ceil(height);

    const context = canvas.getContext("2d");
    context.fillStyle = "#050814";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (pngBlob) {
      downloadBlob(pngBlob, `diagram-${stamp()}-${canvas.width}x${canvas.height}.png`);
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `diagram-${stamp()}-${canvas.width}x${canvas.height}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function buildDiagramSVG(snapshot, { padding = 80 } = {}) {
  const nodes = snapshot.nodes || [];
  const edges = snapshot.edges || [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const bounds = computeBounds(nodes);

  const width = Math.max(1, bounds.maxX - bounds.minX + padding * 2);
  const height = Math.max(1, bounds.maxY - bounds.minY + padding * 2);
  const viewX = bounds.minX - padding;
  const viewY = bounds.minY - padding;

  const edgesMarkup = edges
    .map((edge) => {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      if (!from || !to) return "";

      return `<path d="${edgePath(from, to)}" fill="none" stroke="url(#edgeGradient)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" />`;
    })
    .join("");

  const nodesMarkup = nodes
    .map((node) => {
      const theme = nodeTheme(node.type);
      const widthNode = node.width || 200;
      const heightNode = node.height || 88;

      if (node.type === "decision" || node.type === "blueprintDecision") {
        const half = Math.min(widthNode, heightNode) * 0.52;
        const points = [
          `${node.x},${node.y - half}`,
          `${node.x + half},${node.y}`,
          `${node.x},${node.y + half}`,
          `${node.x - half},${node.y}`
        ].join(" ");

        return `<g filter="url(#dropShadow)"><polygon points="${points}" fill="${theme.fill}" stroke="${theme.stroke}" stroke-width="1.2"/>${svgLabel(node.label, node.x, node.y, Math.min(widthNode, 260))}</g>`;
      }

      if (node.type === "start" || node.type === "end") {
        const radius = Math.min(widthNode, heightNode) * 0.36;
        return `<g filter="url(#dropShadow)"><circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="${theme.fill}" stroke="${theme.stroke}" stroke-width="1.2"/>${svgLabel(node.label, node.x, node.y, Math.min(widthNode, 240))}</g>`;
      }

      return `<g filter="url(#dropShadow)"><rect x="${node.x - widthNode / 2}" y="${node.y - heightNode / 2}" width="${widthNode}" height="${heightNode}" rx="20" fill="${theme.fill}" stroke="${theme.stroke}" stroke-width="1.2"/>${svgLabel(node.label, node.x, node.y, Math.min(widthNode, 330))}</g>`;
    })
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewX} ${viewY} ${width} ${height}">
  <defs>
    <linearGradient id="edgeGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7CB8FF" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="#AA79FF" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#6DE8FF" stop-opacity="0.92"/>
    </linearGradient>
    <filter id="dropShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect x="${viewX}" y="${viewY}" width="${width}" height="${height}" fill="rgba(5,8,20,0)" />
  ${edgesMarkup}
  ${nodesMarkup}
</svg>`;

  return { svg, width, height };
}

function edgePath(from, to) {
  const curve = Math.max(60, Math.abs(to.x - from.x) * 0.45);
  const sign = Math.sign(to.x - from.x || 1);
  const c1x = from.x + curve * sign;
  const c2x = to.x - curve * sign;
  return `M ${from.x} ${from.y} C ${c1x} ${from.y}, ${c2x} ${to.y}, ${to.x} ${to.y}`;
}

function svgLabel(label, x, y, width) {
  const clipped = truncate(label, width);
  const safe = escapeXml(clipped);

  return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.93)" font-family="'Sora', 'Manrope', ui-sans-serif, system-ui" font-size="13"><tspan>${safe}</tspan></text>`;
}

function truncate(text, width) {
  const raw = String(text || "");
  const limit = Math.max(10, Math.floor(width / 7));
  if (raw.length <= limit) return raw;
  return `${raw.slice(0, limit - 1).trim()}...`;
}

function escapeXml(text) {
  return String(text).replace(/[<>&'\"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}

function nodeTheme(type) {
  switch (type) {
    case "start":
      return { fill: "rgba(34,197,94,0.16)", stroke: "rgba(34,197,94,0.5)" };
    case "end":
      return { fill: "rgba(239,68,68,0.14)", stroke: "rgba(239,68,68,0.5)" };
    case "decision":
      return { fill: "rgba(245,158,11,0.15)", stroke: "rgba(245,158,11,0.5)" };
    case "blueprintDecision":
      return { fill: "rgba(250,204,21,0.15)", stroke: "rgba(250,204,21,0.5)" };
    default:
      return { fill: "rgba(96,165,250,0.14)", stroke: "rgba(96,165,250,0.48)" };
  }
}

function downloadBlob(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function stamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours()
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

import { create } from "zustand";
import { computeBounds, generateDiagramModel } from "../utils/layoutEngine.js";
import { clamp, uid, validatePrompt } from "../utils/validators.js";

const DEFAULT_VIEWPORT = { x: 0, y: 0, scale: 1 };

export const useUiStore = create((set, get) => ({
  started: false,
  kind: "workflow",
  prompt: "",
  generating: false,
  nodes: [],
  edges: [],
  generation: 0,
  viewport: DEFAULT_VIEWPORT,
  boardSize: { width: 0, height: 0 },
  toasts: [],

  startApp: () => set({ started: true }),

  setKind: (kind) => set({ kind }),
  setPrompt: (prompt) => set({ prompt }),

  pushToast: (message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: uid("toast"), message }]
    })),

  pushError: (message) => get().pushToast(message),

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  setBoardSize: (size) =>
    set({
      boardSize: {
        width: Math.max(0, size?.width || 0),
        height: Math.max(0, size?.height || 0)
      }
    }),

  setViewport: (viewport) => {
    const current = get().viewport;
    set({
      viewport: {
        x: viewport.x ?? current.x,
        y: viewport.y ?? current.y,
        scale: clamp(viewport.scale ?? current.scale, 0.25, 2.6)
      }
    });
  },

  zoomBy: (delta) => {
    const current = get().viewport;
    set({
      viewport: {
        ...current,
        scale: clamp(current.scale + delta, 0.25, 2.6)
      }
    });
  },

  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),

  fitToDiagram: () => {
    const { nodes, boardSize } = get();
    if (!nodes.length || boardSize.width < 80 || boardSize.height < 80) return;

    const padding = 120;
    const bounds = computeBounds(nodes);
    const diagramWidth = Math.max(1, bounds.maxX - bounds.minX + padding * 2);
    const diagramHeight = Math.max(1, bounds.maxY - bounds.minY + padding * 2);

    const scale = clamp(
      Math.min(boardSize.width / diagramWidth, boardSize.height / diagramHeight),
      0.25,
      2.6
    );

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    set({
      viewport: {
        x: -centerX * scale,
        y: -centerY * scale,
        scale
      }
    });
  },

  updateNodePosition: (id, nextPosition) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...nextPosition } : node
      )
    })),

  generate: async () => {
    const { prompt, kind } = get();
    const check = validatePrompt(prompt);

    if (!check.ok) {
      get().pushError(check.message);
      return;
    }

    set({ generating: true });

    try {
      const model = await generateDiagramModel({ prompt, kind });
      set((state) => ({
        nodes: model.nodes,
        edges: model.edges,
        generation: state.generation + 1
      }));
    } catch (error) {
      get().pushError(error?.message || "Failed to generate diagram.");
    } finally {
      set({ generating: false });
    }
  }
}));

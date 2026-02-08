import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { useUiStore } from "../store/uiStore.js";
import { computeBounds } from "../utils/layoutEngine.js";
import { EASE_OUT_QUINT } from "../utils/motion.js";
import GlassNode from "./GlassNode.jsx";

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.6;

export default function CanvasBoard() {
  const boardRef = useRef(null);
  const panRef = useRef(null);
  const smoothRafRef = useRef(0);
  const localAnimationRef = useRef(false);
  const targetViewportRef = useRef({ x: 0, y: 0, scale: 1 });
  const currentViewportRef = useRef({ x: 0, y: 0, scale: 1 });

  const kind = useUiStore((state) => state.kind);
  const nodes = useUiStore((state) => state.nodes);
  const edges = useUiStore((state) => state.edges);
  const viewport = useUiStore((state) => state.viewport);
  const boardSize = useUiStore((state) => state.boardSize);
  const generation = useUiStore((state) => state.generation);
  const setViewport = useUiStore((state) => state.setViewport);
  const setBoardSize = useUiStore((state) => state.setBoardSize);

  useEffect(() => {
    currentViewportRef.current = viewport;
    if (!localAnimationRef.current) {
      targetViewportRef.current = viewport;
    }
  }, [viewport]);

  useEffect(() => {
    const element = boardRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setBoardSize({ width: rect.width, height: rect.height });
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [setBoardSize]);

  const bounds = useMemo(() => computeBounds(nodes), [nodes]);
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const edgeLayer = useMemo(() => {
    const padding = 600;
    return {
      x: bounds.minX - padding,
      y: bounds.minY - padding,
      width: Math.max(1, bounds.maxX - bounds.minX + padding * 2),
      height: Math.max(1, bounds.maxY - bounds.minY + padding * 2)
    };
  }, [bounds]);

  const transform = useMemo(() => {
    const centerX = boardSize.width / 2 + viewport.x;
    const centerY = boardSize.height / 2 + viewport.y;
    return `translate3d(${centerX}px, ${centerY}px, 0) scale(${viewport.scale})`;
  }, [boardSize.height, boardSize.width, viewport.scale, viewport.x, viewport.y]);

  const gridStyle = useMemo(() => {
    const centerX = boardSize.width / 2 + viewport.x;
    const centerY = boardSize.height / 2 + viewport.y;
    const gridUnit = 48 * viewport.scale;

    return {
      "--grid-unit": `${gridUnit}px`,
      backgroundPosition: `${centerX}px ${centerY}px`
    };
  }, [boardSize.height, boardSize.width, viewport.scale, viewport.x, viewport.y]);

  function startSmoothing() {
    if (smoothRafRef.current) return;
    localAnimationRef.current = true;

    const tick = () => {
      const current = currentViewportRef.current;
      const target = targetViewportRef.current;

      const nextX = lerp(current.x, target.x, 0.2);
      const nextY = lerp(current.y, target.y, 0.2);
      const nextScale = lerp(current.scale, target.scale, 0.22);

      const closeEnough =
        Math.abs(nextX - target.x) < 0.16 &&
        Math.abs(nextY - target.y) < 0.16 &&
        Math.abs(nextScale - target.scale) < 0.0015;

      const next = closeEnough
        ? target
        : {
            x: nextX,
            y: nextY,
            scale: nextScale
          };

      currentViewportRef.current = next;
      setViewport(next);

      if (closeEnough) {
        smoothRafRef.current = 0;
        localAnimationRef.current = false;
        return;
      }

      smoothRafRef.current = requestAnimationFrame(tick);
    };

    smoothRafRef.current = requestAnimationFrame(tick);
  }

  function queueViewport(nextPartial) {
    targetViewportRef.current = {
      x: nextPartial.x ?? targetViewportRef.current.x,
      y: nextPartial.y ?? targetViewportRef.current.y,
      scale: clamp(nextPartial.scale ?? targetViewportRef.current.scale, ZOOM_MIN, ZOOM_MAX)
    };
    startSmoothing();
  }

  function zoomAroundClientPoint(clientX, clientY, zoomAmount) {
    const element = boardRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    const source = targetViewportRef.current;
    const currentScale = source.scale;
    const nextScale = clamp(currentScale * zoomAmount, ZOOM_MIN, ZOOM_MAX);
    const ratio = nextScale / currentScale;

    const originX = rect.width / 2 + source.x;
    const originY = rect.height / 2 + source.y;

    const nextOriginX = localX - ratio * (localX - originX);
    const nextOriginY = localY - ratio * (localY - originY);

    queueViewport({
      scale: nextScale,
      x: nextOriginX - rect.width / 2,
      y: nextOriginY - rect.height / 2
    });
  }

  function smoothZoomBy(step) {
    const element = boardRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    zoomAroundClientPoint(centerX, centerY, 1 + step);
  }

  function animateFitToDiagram() {
    if (!nodes.length || boardSize.width < 80 || boardSize.height < 80) return;

    const padding = 120;
    const width = Math.max(1, bounds.maxX - bounds.minX + padding * 2);
    const height = Math.max(1, bounds.maxY - bounds.minY + padding * 2);

    const scale = clamp(Math.min(boardSize.width / width, boardSize.height / height), ZOOM_MIN, ZOOM_MAX);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    queueViewport({
      x: -centerX * scale,
      y: -centerY * scale,
      scale
    });
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    if (event.target?.closest?.("[data-glass-node]")) return;

    const element = boardRef.current;
    if (!element) return;
    element.setPointerCapture?.(event.pointerId);

    const now = performance.now();
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: targetViewportRef.current.x,
      baseY: targetViewportRef.current.y,
      prevX: event.clientX,
      prevY: event.clientY,
      prevT: now,
      velocityX: 0,
      velocityY: 0
    };
  }

  function onPointerMove(event) {
    if (!panRef.current) return;

    const now = performance.now();
    const dt = Math.max(16, now - panRef.current.prevT);
    const dxFrame = event.clientX - panRef.current.prevX;
    const dyFrame = event.clientY - panRef.current.prevY;

    panRef.current.velocityX = dxFrame / dt;
    panRef.current.velocityY = dyFrame / dt;
    panRef.current.prevX = event.clientX;
    panRef.current.prevY = event.clientY;
    panRef.current.prevT = now;

    const dx = event.clientX - panRef.current.startX;
    const dy = event.clientY - panRef.current.startY;

    queueViewport({
      x: panRef.current.baseX + dx,
      y: panRef.current.baseY + dy
    });
  }

  function onPointerUp(event) {
    boardRef.current?.releasePointerCapture?.(event.pointerId);
    if (!panRef.current) return;

    const momentum = 220;
    queueViewport({
      x: targetViewportRef.current.x + panRef.current.velocityX * momentum,
      y: targetViewportRef.current.y + panRef.current.velocityY * momentum
    });

    panRef.current = null;
  }

  function onWheel(event) {
    const element = boardRef.current;
    if (!element) return;
    event.preventDefault();

    const zoomAmount = 1 - event.deltaY * 0.0018;
    zoomAroundClientPoint(event.clientX, event.clientY, zoomAmount);
  }

  useEffect(() => {
    if (!generation) return;
    animateFitToDiagram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation, boardSize.width, boardSize.height]);

  useEffect(() => {
    return () => {
      if (smoothRafRef.current) cancelAnimationFrame(smoothRafRef.current);
    };
  }, []);

  return (
    <div className="glass-panel glass-breathe relative h-full w-full min-h-[440px] touch-none overflow-hidden rounded-3xl">
      <div
        ref={boardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        className="grid-layer absolute inset-0"
        style={gridStyle}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/20" />

        <div className="absolute left-0 top-0 will-change-transform" style={{ transform, transformOrigin: "0 0" }}>
          <svg
            width={edgeLayer.width}
            height={edgeLayer.height}
            style={{ left: edgeLayer.x, top: edgeLayer.y, width: edgeLayer.width, height: edgeLayer.height }}
            className="pointer-events-none absolute overflow-visible"
          >
            <defs>
              <linearGradient id="glassEdgeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7CB8FF" stopOpacity="0.92" />
                <stop offset="0.52" stopColor="#AA79FF" stopOpacity="0.86" />
                <stop offset="1" stopColor="#6DE8FF" stopOpacity="0.88" />
              </linearGradient>
            </defs>
            {edges.map((edge) => {
              const from = nodeById.get(edge.from);
              const to = nodeById.get(edge.to);
              if (!from || !to) return null;

              return (
                <motion.path
                  key={edge.id}
                  d={buildEdgePath(from, to, edgeLayer)}
                  fill="none"
                  stroke="url(#glassEdgeGradient)"
                  strokeWidth={2.3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.95 }}
                  transition={{ duration: 0.52, ease: EASE_OUT_QUINT }}
                  className="edge-animated"
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <GlassNode key={node.id} node={node} kind={kind} />
          ))}
        </div>
      </div>

      {nodes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: EASE_OUT_QUINT }}
          className="pointer-events-none absolute inset-0 grid place-items-center p-6"
        >
          <div className="glass-surface glass-breathe max-w-[520px] rounded-2xl px-5 py-4 text-center">
            <p className="text-sm font-semibold text-white/88">Describe your system and generate a diagram</p>
            <p className="mt-1 text-sm text-white/62">
              Drag to pan, scroll to zoom, then export to PNG, SVG, or JSON.
            </p>
          </div>
        </motion.div>
      ) : null}

      <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-1">
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.42, ease: EASE_OUT_QUINT }}
          onClick={() => smoothZoomBy(-0.12)}
          className="pointer-events-auto glass-chip rounded-xl px-3 py-2 text-xs font-medium text-white/80"
        >
          Zoom -
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.42, ease: EASE_OUT_QUINT }}
          onClick={() => smoothZoomBy(0.12)}
          className="pointer-events-auto glass-chip rounded-xl px-3 py-2 text-xs font-medium text-white/80"
        >
          Zoom +
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.42, ease: EASE_OUT_QUINT }}
          onClick={animateFitToDiagram}
          className="pointer-events-auto glass-chip rounded-xl px-3 py-2 text-xs font-medium text-white/80"
        >
          Fit
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.42, ease: EASE_OUT_QUINT }}
          onClick={() => queueViewport({ x: 0, y: 0, scale: 1 })}
          className="pointer-events-auto glass-chip rounded-xl px-3 py-2 text-xs font-medium text-white/80"
        >
          Reset
        </motion.button>
      </div>
    </div>
  );
}

function buildEdgePath(from, to, layer) {
  const fromX = from.x - layer.x;
  const fromY = from.y - layer.y;
  const toX = to.x - layer.x;
  const toY = to.y - layer.y;
  const curve = Math.max(70, Math.abs(toX - fromX) * 0.48);
  const direction = Math.sign(toX - fromX || 1);

  return `M ${fromX} ${fromY} C ${fromX + curve * direction} ${fromY}, ${toX - curve * direction} ${toY}, ${toX} ${toY}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

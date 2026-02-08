import { motion } from "framer-motion";
import { Diamond, Flag, Layers3, PlayCircle, StopCircle } from "lucide-react";
import { useRef } from "react";
import { useUiStore } from "../store/uiStore.js";
import { EASE_OUT_QUINT } from "../utils/motion.js";

export default function GlassNode({ node, kind }) {
  const viewportScale = useUiStore((state) => state.viewport.scale);
  const updateNodePosition = useUiStore((state) => state.updateNodePosition);

  const draggingRef = useRef(null);
  const rafRef = useRef(0);

  const width = node.width || 200;
  const height = node.height || 86;
  const tone = nodeTone(node.type, kind);
  const Icon = tone.Icon;

  function onPointerDown(event) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    draggingRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: node.x,
      baseY: node.y
    };
  }

  function onPointerMove(event) {
    if (!draggingRef.current) return;
    event.stopPropagation();

    const dx = (event.clientX - draggingRef.current.startX) / viewportScale;
    const dy = (event.clientY - draggingRef.current.startY) / viewportScale;
    const next = { x: draggingRef.current.baseX + dx, y: draggingRef.current.baseY + dy };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => updateNodePosition(node.id, next));
  }

  function onPointerUp(event) {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    draggingRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }

  return (
    <motion.article
      layout
      data-glass-node
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: EASE_OUT_QUINT }}
      className="absolute select-none"
      style={{
        width: tone.shape === "diamond" ? Math.max(width, height) : width,
        height: tone.shape === "diamond" ? Math.max(width, height) : height,
        transform: `translate3d(${node.x}px, ${node.y}px, 0) translate(-50%, -50%)`
      }}
    >
      {tone.shape === "diamond" ? (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative h-full w-full cursor-grab active:cursor-grabbing"
        >
          <div className="absolute inset-0 grid place-items-center">
            <div
              className={["glass-node", tone.ring, tone.tint].join(" ")}
              style={{
                width: Math.min(width, height) * 0.84,
                height: Math.min(width, height) * 0.84,
                transform: "rotate(45deg)",
                borderRadius: 22
              }}
            >
              <div className="flex h-full w-full items-center justify-center" style={{ transform: "rotate(-45deg)" }}>
                <div className="text-center">
                  <span className="glass-chip mx-auto mb-2 grid h-8 w-8 place-items-center rounded-xl">
                    <Icon className={["h-4 w-4", tone.icon].join(" ")} />
                  </span>
                  <p className="max-w-[160px] text-sm font-semibold leading-tight text-white/90">{node.label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={["glass-node h-full w-full cursor-grab rounded-2xl", tone.ring, tone.tint].join(" ")}
        >
          {kind === "blueprint" || node.type === "blueprint" ? (
            <div className="flex h-full flex-col px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="glass-chip grid h-9 w-9 place-items-center rounded-xl">
                    <Icon className={["h-4 w-4", tone.icon].join(" ")} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/90">{node.label}</p>
                    <p className="text-xs text-white/56">Component</p>
                  </div>
                </div>
                <span className="glass-chip rounded-full px-2 py-1 text-[11px] text-white/62">Block</span>
              </div>
              <div className="mt-3 flex-1 rounded-xl border border-white/12 bg-gradient-to-br from-white/[0.08] to-white/[0.02]" />
            </div>
          ) : (
            <div className="flex h-full items-center gap-3 px-4">
              <span className="glass-chip grid h-10 w-10 place-items-center rounded-2xl">
                <Icon className={["h-5 w-5", tone.icon].join(" ")} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white/90">{node.label}</p>
                <p className="text-xs text-white/56">{tone.caption}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.article>
  );
}

function nodeTone(type, kind) {
  if (type === "start") {
    return {
      shape: "card",
      ring: "ring-emerald-300/30",
      tint: "node-start",
      icon: "text-emerald-200/95",
      caption: "Start",
      Icon: Flag
    };
  }

  if (type === "end") {
    return {
      shape: "card",
      ring: "ring-rose-300/30",
      tint: "node-end",
      icon: "text-rose-200/95",
      caption: "End",
      Icon: StopCircle
    };
  }

  if (type === "decision" || type === "blueprintDecision") {
    return {
      shape: "diamond",
      ring: "ring-amber-300/30",
      tint: "node-decision",
      icon: "text-amber-200/95",
      caption: "Decision",
      Icon: Diamond
    };
  }

  if (kind === "blueprint" || type === "blueprint") {
    return {
      shape: "card",
      ring: "ring-cyan-300/26",
      tint: "node-blueprint",
      icon: "text-cyan-200/95",
      caption: "Blueprint",
      Icon: Layers3
    };
  }

  return {
    shape: "card",
    ring: "ring-blue-300/28",
    tint: "node-process",
    icon: "text-blue-200/95",
    caption: "Process",
    Icon: PlayCircle
  };
}

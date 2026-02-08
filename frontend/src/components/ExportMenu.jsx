import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileJson2, ImageDown, Shapes } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUiStore } from "../store/uiStore.js";
import { downloadDiagramJSON, downloadDiagramPNG, downloadDiagramSVG } from "../utils/exporters.js";
import { EASE_OUT_QUINT } from "../utils/motion.js";

export default function ExportMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const kind = useUiStore((state) => state.kind);
  const nodes = useUiStore((state) => state.nodes);
  const edges = useUiStore((state) => state.edges);
  const pushError = useUiStore((state) => state.pushError);

  const canExport = nodes.length > 0;
  const snapshot = useMemo(() => ({ kind, nodes, edges }), [kind, nodes, edges]);

  useEffect(() => {
    function handleOutsidePointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!canExport}
        whileHover={canExport ? { y: -2 } : undefined}
        whileTap={canExport ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.44, ease: EASE_OUT_QUINT }}
        className={[
          "glass-surface glass-hover inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50",
          canExport ? "text-white/88" : "cursor-not-allowed text-white/45"
        ].join(" ")}
      >
        <span className="glass-chip grid h-8 w-8 place-items-center rounded-xl">
          <ImageDown className="h-4 w-4" />
        </span>
        Export
        <ChevronDown className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.46, ease: EASE_OUT_QUINT }}
            className="absolute right-0 top-full z-30 w-[220px]"
          >
            <div className="glass-panel rounded-2xl p-2">
              <MenuItem
                icon={<ImageDown className="h-4 w-4" />}
                label="Export PNG"
                onClick={() => {
                  setOpen(false);
                  downloadDiagramPNG(snapshot).catch(() => pushError("PNG export failed."));
                }}
              />
              <MenuItem
                icon={<Shapes className="h-4 w-4" />}
                label="Export SVG"
                onClick={() => {
                  setOpen(false);
                  try {
                    downloadDiagramSVG(snapshot);
                  } catch {
                    pushError("SVG export failed.");
                  }
                }}
              />
              <MenuItem
                icon={<FileJson2 className="h-4 w-4" />}
                label="Export JSON"
                onClick={() => {
                  setOpen(false);
                  try {
                    downloadDiagramJSON(snapshot);
                  } catch {
                    pushError("JSON export failed.");
                  }
                }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.42, ease: EASE_OUT_QUINT }}
      className="glass-chip mb-1.5 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/82 hover:text-white"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/14 bg-white/[0.07]">{icon}</span>
      {label}
    </motion.button>
  );
}

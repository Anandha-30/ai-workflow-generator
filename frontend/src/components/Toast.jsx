import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useUiStore } from "../store/uiStore.js";
import { EASE_OUT_QUINT } from "../utils/motion.js";

export default function Toast() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);
  const timersRef = useRef(new Map());

  useEffect(() => {
    const liveIds = new Set(toasts.map((toast) => toast.id));

    for (const toast of toasts) {
      if (timersRef.current.has(toast.id)) continue;
      const timer = setTimeout(() => dismissToast(toast.id), 5000);
      timersRef.current.set(toast.id, timer);
    }

    for (const [id, timer] of timersRef.current.entries()) {
      if (liveIds.has(id)) continue;
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, [dismissToast, toasts]);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) clearTimeout(timer);
      timersRef.current.clear();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[100] flex w-[min(420px,calc(100vw-40px))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: -12, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -12, y: 8 }}
            transition={{ duration: 0.42, ease: EASE_OUT_QUINT }}
            className="pointer-events-auto"
          >
            <div className="glass-panel flex items-start gap-3 rounded-2xl p-3">
              <span className="glass-chip mt-0.5 grid h-9 w-9 place-items-center rounded-xl text-amber-200/90">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white/86">Error</p>
                <p className="text-sm leading-relaxed text-white/68">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="glass-chip grid h-9 w-9 place-items-center rounded-xl text-white/70 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

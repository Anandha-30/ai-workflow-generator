import { motion } from "framer-motion";
import { Boxes, GitBranch, Workflow } from "lucide-react";
import { useUiStore } from "../store/uiStore.js";
import { EASE_OUT_QUINT } from "../utils/motion.js";

const tabs = [
  { key: "workflow", label: "Workflow", Icon: Workflow },
  { key: "flowchart", label: "Flowchart", Icon: GitBranch },
  { key: "blueprint", label: "Blueprint", Icon: Boxes }
];

export default function DiagramTabs() {
  const kind = useUiStore((state) => state.kind);
  const setKind = useUiStore((state) => state.setKind);

  return (
    <div className="glass-surface relative rounded-2xl p-1">
      <div className="flex items-center gap-1">
        {tabs.map(({ key, label, Icon }) => {
          const active = kind === key;
          return (
            <motion.button
              key={key}
              type="button"
              onClick={() => setKind(key)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={[
                "relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium outline-none",
                "focus-visible:ring-2 focus-visible:ring-cyan-300/50",
                active ? "text-white" : "text-white/68 hover:text-white/88"
              ].join(" ")}
            >
              {active ? (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/30 via-violet-400/28 to-cyan-300/30 ring-1 ring-white/25"
                  transition={{ duration: 0.4, ease: EASE_OUT_QUINT }}
                />
              ) : null}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import CanvasBoard from "../components/CanvasBoard.jsx";
import DiagramTabs from "../components/DiagramTabs.jsx";
import ExportMenu from "../components/ExportMenu.jsx";
import GlassContainer from "../components/GlassContainer.jsx";
import PromptBox from "../components/PromptBox.jsx";
import { EASE_OUT_QUINT, SECTION_STAGGER } from "../utils/motion.js";

export default function Generator() {
  return (
    <motion.div
      variants={SECTION_STAGGER}
      initial="hidden"
      animate="show"
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.46, ease: EASE_OUT_QUINT }}
      >
        <GlassContainer className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="glass-chip grid h-10 w-10 place-items-center rounded-2xl">
              <Sparkles className="h-5 w-5 text-cyan-200/90" />
            </span>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white/94">Diagram Generator</h1>
              <p className="text-xs text-white/58">Workflow, Flowchart, Blueprint</p>
            </div>
          </div>

          <DiagramTabs />
        </GlassContainer>
      </motion.header>

      <PromptBox />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUINT }}
        className="relative min-h-0 flex-1"
      >
        <CanvasBoard />
        <div className="pointer-events-none absolute right-4 top-4 z-20">
          <div className="pointer-events-auto">
            <ExportMenu />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

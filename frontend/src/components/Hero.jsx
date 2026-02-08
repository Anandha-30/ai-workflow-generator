import { motion } from "framer-motion";
import { ArrowDownRight, Sparkles } from "lucide-react";
import GlassContainer from "./GlassContainer.jsx";
import { useUiStore } from "../store/uiStore.js";
import { EASE_OUT_QUINT, SECTION_STAGGER } from "../utils/motion.js";

export default function Hero() {
  const startApp = useUiStore((state) => state.startApp);
  const headingLines = [
    "Design Workflows, Flowcharts",
    "and Blueprints with AI"
  ];

  const scrollToExamples = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <GlassContainer className="relative overflow-hidden p-6 md:p-9" hover>
      <div className="hero-glow pointer-events-none absolute inset-0" />

      <motion.div
        variants={SECTION_STAGGER}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        <motion.span
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT_QUINT } }
          }}
          className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide text-white/82"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-200/90" />
          AI Diagram SaaS
        </motion.span>

        <h1 className="neon-heading mt-4 max-w-5xl text-4xl font-semibold leading-[1.06] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
          {headingLines.map((line, index) => (
            <motion.span
              key={line}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.56, delay: index * 0.08, ease: EASE_OUT_QUINT }
                }
              }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_QUINT } }
          }}
          className="mt-5 max-w-2xl text-base leading-[1.72] text-white/74 md:text-lg"
        >
          Turn natural language into structured, production-ready diagrams.
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: EASE_OUT_QUINT } }
          }}
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.44, ease: EASE_OUT_QUINT }}
            onClick={startApp}
            className="glass-button-primary rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Get Started
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.44, ease: EASE_OUT_QUINT }}
            onClick={scrollToExamples}
            className="glass-button-secondary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium"
          >
            View Examples
            <ArrowDownRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </GlassContainer>
  );
}

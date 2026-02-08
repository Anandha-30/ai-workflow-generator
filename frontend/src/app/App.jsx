import { AnimatePresence, motion } from "framer-motion";
import Layout from "./Layout.jsx";
import Landing from "./Landing.jsx";
import Generator from "./Generator.jsx";
import { useUiStore } from "../store/uiStore.js";
import { EASE_OUT_QUINT } from "../utils/motion.js";

const landingMotion = {
  initial: { opacity: 0, y: 26, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(10px)" }
};

const generatorMotion = {
  initial: { opacity: 0, y: 34, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(10px)" }
};

export default function App() {
  const started = useUiStore((state) => state.started);

  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        {started ? (
          <motion.section
            key="generator"
            variants={generatorMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.58, ease: EASE_OUT_QUINT }}
            className="flex min-h-0 flex-1"
          >
            <Generator />
          </motion.section>
        ) : (
          <motion.section
            key="landing"
            variants={landingMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.58, ease: EASE_OUT_QUINT }}
            className="flex min-h-0 flex-1"
          >
            <Landing />
          </motion.section>
        )}
      </AnimatePresence>
    </Layout>
  );
}

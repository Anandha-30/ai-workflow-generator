import { motion } from "framer-motion";
import { BookOpen, Building2, Cpu, GitBranch, Network, Workflow } from "lucide-react";
import FeatureCard from "../components/FeatureCard.jsx";
import GlassContainer from "../components/GlassContainer.jsx";
import Hero from "../components/Hero.jsx";
import { EASE_OUT_QUINT, FADE_UP, SECTION_STAGGER } from "../utils/motion.js";

const features = [
  {
    title: "Workflow Automation",
    description: "Generate clean operational paths from natural language with production-safe structure.",
    Icon: Workflow
  },
  {
    title: "Decision-based Flowcharts",
    description: "Model conditional logic with readable branches and clear outcome paths.",
    Icon: GitBranch
  },
  {
    title: "System Blueprints",
    description: "Turn architecture intent into modular blocks that teams can execute quickly.",
    Icon: Network
  }
];

const useCases = [
  { label: "Software Architecture", Icon: Building2 },
  { label: "Business Process Design", Icon: Cpu },
  { label: "AI Pipelines", Icon: Network },
  { label: "Education and Exams", Icon: BookOpen }
];

export default function Landing() {
  return (
    <motion.div
      variants={SECTION_STAGGER}
      initial="hidden"
      animate="show"
      className="flex min-h-0 flex-1 flex-col gap-6 lg:gap-7"
    >
      <Hero />

      <motion.section
        id="features"
        variants={FADE_UP}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: EASE_OUT_QUINT }}
        className="-mt-2 md:-mt-3"
      >
        <GlassContainer className="relative z-10 p-5 md:p-6" hover>
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight text-white/95">Built for production planning</h2>
            <p className="mt-1 text-sm text-white/65">
              Every surface is optimized for clarity, speed, and high-stakes diagram authoring.
            </p>
          </div>
          <motion.div
            variants={SECTION_STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 md:grid-cols-3"
          >
            {features.map((item, index) => (
              <FeatureCard key={item.title} {...item} index={index} />
            ))}
          </motion.div>
        </GlassContainer>
      </motion.section>

      <motion.section
        id="use-cases"
        variants={FADE_UP}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.52, delay: 0.06, ease: EASE_OUT_QUINT }}
        className="-mt-1 md:-mt-2"
      >
        <GlassContainer className="relative z-[8] p-5 md:p-6" hover>
          <div className="mb-4">
            <h3 className="text-base font-semibold tracking-tight text-white/95">Use cases</h3>
          </div>
          <motion.div
            variants={SECTION_STAGGER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {useCases.map(({ label, Icon }) => (
              <motion.div
                key={label}
                variants={FADE_UP}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.44, ease: EASE_OUT_QUINT }}
                className="glass-surface glass-hover flex items-center gap-3 rounded-2xl px-4 py-4"
              >
                <span className="glass-chip grid h-10 w-10 place-items-center rounded-xl">
                  <Icon className="h-4 w-4 text-cyan-200/90" />
                </span>
                <span className="text-sm font-medium text-white/88">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </GlassContainer>
      </motion.section>

      <footer className="glass-panel mt-auto rounded-2xl px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight text-white/93">Diagram Generator</p>
            <p className="text-xs text-white/58">Design workflows, flowcharts and blueprints with AI.</p>
          </div>
          <nav className="flex items-center gap-2 text-xs text-white/70">
            <a href="#features" className="glass-chip rounded-full px-3 py-2 hover:text-white/90">
              Features
            </a>
            <a href="#use-cases" className="glass-chip rounded-full px-3 py-2 hover:text-white/90">
              Use Cases
            </a>
            <a href="#" className="glass-chip rounded-full px-3 py-2 hover:text-white/90">
              Security
            </a>
          </nav>
        </div>
      </footer>
    </motion.div>
  );
}

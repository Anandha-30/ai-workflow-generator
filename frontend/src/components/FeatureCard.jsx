import { motion } from "framer-motion";
import { EASE_OUT_QUINT } from "../utils/motion.js";

export default function FeatureCard({ title, description, Icon, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.42, delay: index * 0.07, ease: EASE_OUT_QUINT }}
      whileHover={{ y: -4 }}
      className="glass-surface glass-hover glass-breathe rounded-2xl p-4"
    >
      <span className="glass-chip mb-4 grid h-11 w-11 place-items-center rounded-xl">
        <Icon className="h-5 w-5 text-blue-200/90" />
      </span>
      <h3 className="text-sm font-semibold tracking-tight text-white/92">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/64">{description}</p>
    </motion.article>
  );
}

import { motion } from "framer-motion";
import { EASE_OUT_QUINT } from "../utils/motion.js";

export default function GlassContainer({
  className = "",
  children,
  hover = false,
  as = "div"
}) {
  const Tag = as;

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.44, ease: EASE_OUT_QUINT }}
      className={["glass-panel glass-breathe", hover ? "glass-hover" : "", className].join(" ").trim()}
    >
      <Tag className="contents">{children}</Tag>
    </motion.div>
  );
}

export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1];

export const MOTION = {
  fast: { duration: 0.42, ease: EASE_OUT_QUINT },
  normal: { duration: 0.5, ease: EASE_OUT_QUINT },
  slow: { duration: 0.58, ease: EASE_OUT_QUINT }
};

export const SECTION_STAGGER = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

export const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: MOTION.normal
  }
};

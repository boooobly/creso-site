import type { Variants } from 'framer-motion';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const viewportOnce = { once: true, amount: 0.2 };

export const fadeUp = (distance = 24): Variants => ({
  hidden: { opacity: 0, y: distance },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
});

export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

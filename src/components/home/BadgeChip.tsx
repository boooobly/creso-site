'use client';

import type { Variants } from 'framer-motion';
import { motion, useReducedMotion } from 'framer-motion';

type BadgeChipProps = {
  label: string;
  index: number;
  variants: Variants;
};

export default function BadgeChip({ label, index, variants }: BadgeChipProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      custom={index}
      variants={variants}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
      className="chip-elevated hero-chip-soft flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200"
    >
      <span className="card-dot" />
      {label}
    </motion.li>
  );
}

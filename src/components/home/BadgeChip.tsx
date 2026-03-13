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
      className="chip-elevated flex items-center gap-1.5 border border-[rgba(212,28,28,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(255,246,246,0.96)_100%)] px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-all duration-200 hover:bg-[var(--brand-red)]/[0.09] hover:shadow-[0_10px_24px_-20px_rgba(212,28,28,0.45)]"
    >
      <span className="card-dot" />
      {label}
    </motion.li>
  );
}

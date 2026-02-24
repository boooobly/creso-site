'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

export default function BadgeChip({ label }: { label: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      variants={fadeUp(12)}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
      className="chip-elevated flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-[var(--brand-red)]/[0.09] hover:shadow-[0_10px_24px_-20px_rgba(212,28,28,0.45)]"
    >
      <span className="card-dot" />
      {label}
    </motion.li>
  );
}

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
      className="rounded-full border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/5 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-[var(--brand-red)]/10"
    >
      {label}
    </motion.li>
  );
}

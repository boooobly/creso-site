'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

export default function BadgeChip({ label }: { label: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      variants={fadeUp(12)}
      whileHover={shouldReduceMotion ? undefined : { y: -1.5 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group relative flex min-h-8 items-center gap-2 overflow-hidden rounded-full border border-[rgba(183,153,153,0.45)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,247,247,0.93)_100%)] px-3 py-[0.4rem] text-xs font-medium leading-none text-neutral-700 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.6)] ring-1 ring-white/80 transition-all duration-300 before:pointer-events-none before:absolute before:inset-x-2 before:top-[1px] before:h-[42%] before:rounded-full before:bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0)_100%)] hover:border-[rgba(212,28,28,0.32)] hover:shadow-[0_14px_28px_-20px_rgba(15,23,42,0.58)]"
    >
      <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-red)] shadow-[0_0_0_2px_rgba(212,28,28,0.12)] transition-transform duration-300 group-hover:scale-110" />
      {label}
    </motion.li>
  );
}

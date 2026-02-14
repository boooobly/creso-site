'use client';
import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

export default function Section({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.section
      className={`bg-neutral-100 py-16 dark:bg-neutral-950 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

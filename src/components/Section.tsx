'use client';
import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

export default function Section({
  children,
  className = '',
  containerClassName = '',
}: PropsWithChildren<{ className?: string; containerClassName?: string }>) {
  return (
    <motion.section
      className={`py-16 ${className}`.trim()}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={`container ${containerClassName}`.trim()}>{children}</div>
    </motion.section>
  );
}

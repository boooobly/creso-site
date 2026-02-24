'use client';

import type { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Container from '@/components/Container';
import { fadeUp, viewportOnce } from '@/lib/motion';

type SectionProps = PropsWithChildren<{
  className?: string;
  containerClassName?: string;
  id?: string;
  background?: 'default' | 'muted';
}>;

const backgroundStyles: Record<NonNullable<SectionProps['background']>, string> = {
  default: 'bg-white',
  muted: 'bg-neutral-50/70',
};

export default function Section({
  children,
  className = '',
  containerClassName = '',
  id,
  background = 'default',
}: SectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={`py-12 md:py-20 ${backgroundStyles[background]} ${className}`.trim()}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'show'}
      viewport={viewportOnce}
      variants={fadeUp(20)}
    >
      <Container className={containerClassName}>{children}</Container>
    </motion.section>
  );
}

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
  fullBleed?: boolean;
  spacing?: 'default' | 'tight' | 'compact' | 'hero';
}>;

const backgroundStyles: Record<NonNullable<SectionProps['background']>, string> = {
  default: 'bg-white',
  muted: 'bg-neutral-50/70',
};

const spacingStyles: Record<NonNullable<SectionProps['spacing']>, string> = {
  default: 'section-rhythm',
  tight: 'section-rhythm-tight',
  compact: 'section-rhythm-compact',
  hero: 'section-rhythm-hero',
};

export default function Section({
  children,
  className = '',
  containerClassName = '',
  id,
  background = 'default',
  fullBleed = false,
  spacing = 'default',
}: SectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const bleedClassName = fullBleed ? 'relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]' : '';

  return (
    <motion.section
      id={id}
      className={`${spacingStyles[spacing]} ${bleedClassName} ${backgroundStyles[background]} ${className}`.trim()}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'show'}
      viewport={viewportOnce}
      variants={fadeUp(20)}
    >
      <Container className={containerClassName}>{children}</Container>
    </motion.section>
  );
}

'use client';

import { type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';

type WideFormatTrustCardsProps = {
  features: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
  }>;
};

export default function WideFormatTrustCards({ features }: WideFormatTrustCardsProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      variants={staggerContainer(0.08)}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'show'}
      viewport={viewportOnce}
    >
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <motion.div
            key={feature.title}
            variants={fadeUp(14)}
            className="h-full rounded-2xl border border-neutral-200 bg-white/90 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)] md:p-6"
          >
            <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
              <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{feature.description}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

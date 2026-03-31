'use client';

import { Building2, ClipboardCheck, Droplets, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';

type WideFormatTrustCardsProps = {
  features: ReadonlyArray<{
    title: string;
    description: string;
    icon: 'building' | 'check' | 'drops' | 'file';
  }>;
};

const iconByKey = {
  building: Building2,
  check: ClipboardCheck,
  drops: Droplets,
  file: FileText,
} as const;

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
        const Icon = iconByKey[feature.icon];

        return (
          <motion.div
            key={feature.title}
            variants={fadeUp(14)}
            className="card-info card-interactive h-full md:p-6"
          >
            <div className="mb-3 inline-flex h-[2.25rem] w-[2.25rem] items-center justify-center rounded-xl border border-red-200/70 bg-red-50 text-red-600">
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

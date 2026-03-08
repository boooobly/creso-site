'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function FeatureCard({
  title,
  category,
  href,
}: {
  title: string;
  category: string;
  href: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22 }}
      className="premium-card group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] w-full border-b border-neutral-200 bg-gradient-to-br from-neutral-100 via-white to-neutral-100 p-4">
        <div className="h-full rounded-2xl border border-dashed border-neutral-300 bg-white/70" />
        <div className="absolute left-7 top-7 h-2.5 w-16 rounded-full bg-neutral-300" />
        <div className="absolute left-7 top-12 h-2 w-24 rounded-full bg-neutral-200" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="inline-flex items-center gap-2 t-eyebrow">
          <span className="card-dot" />
          {category}
        </p>
        <h3 className="t-h3 line-clamp-2 leading-snug">{title}</h3>
        <p className="text-sm text-neutral-600">Проект с подготовленной медиа-зоной, описанием и структурой для кейса.</p>
        <Link href={href} className="t-link group/link mt-auto">
          Смотреть кейс <ArrowRight className="size-4 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}

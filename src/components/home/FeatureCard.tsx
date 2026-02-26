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
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.22 }}
      className="premium-card flex h-full flex-col"
    >
      <div className="aspect-[16/9] w-full bg-gradient-to-br from-neutral-100 via-neutral-50 to-white" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="inline-flex items-center gap-2 t-eyebrow"><span className="card-dot" />{category}</p>
        <h3 className="t-h3 line-clamp-2 leading-snug">{title}</h3>
        <Link href={href} className="t-link group/link mt-4">
          Смотреть кейс <ArrowRight className="size-4 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

export default function FeatureCard({
  title,
  description,
  imageSrc,
}: {
  title: string;
  description: string;
  imageSrc: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22 }}
      className="premium-card group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-neutral-200/90 bg-neutral-100">
        <Image src={imageSrc} alt={title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(min-width: 768px) 33vw, 100vw" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/15 via-transparent to-white/20" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <h3 className="t-h3 line-clamp-2 leading-snug">{title}</h3>
        <p className="t-body">{description}</p>
      </div>
    </motion.article>
  );
}

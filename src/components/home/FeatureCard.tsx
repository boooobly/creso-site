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
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-neutral-200">
        <Image src={imageSrc} alt={title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="t-h3 line-clamp-2 leading-snug">{title}</h3>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
    </motion.article>
  );
}

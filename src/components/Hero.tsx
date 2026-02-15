'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { SiteMessages } from '@/lib/messages';

export default function Hero({ t }: { t: SiteMessages }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative overflow-hidden">
      <div className="container grid gap-5 py-14 md:gap-6 md:py-24">
        <motion.h1
          className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.hero.title}
        </motion.h1>

        <motion.p
          className="max-w-2xl text-base text-neutral-700 dark:text-neutral-300 md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Link className="btn-primary no-underline text-center" href="/#lead-form">
            {t.hero.ctas.primary}
          </Link>
          <Link className="btn-secondary no-underline text-center" href="/portfolio">
            {t.hero.ctas.secondary}
          </Link>
        </motion.div>
      </div>

      {mounted && (
        <motion.div
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--brand-red)]/10 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      )}
    </div>
  );
}

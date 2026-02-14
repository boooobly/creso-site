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
      <div className="container grid gap-6 py-16 md:py-24">
        <motion.h1 className="text-3xl font-bold leading-tight md:text-5xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {t.hero.title}
        </motion.h1>
        <motion.p className="max-w-3xl text-lg text-neutral-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {t.hero.subtitle}
        </motion.p>
        <div className="grid gap-3 md:grid-cols-3">
          <Link className="btn-primary no-underline text-center" href="/baget">{t.hero.ctas.baget}</Link>
          <Link className="btn-secondary no-underline text-center" href="/services">{t.hero.ctas.services}</Link>
          <Link className="btn-primary no-underline text-center" href="/production">{t.hero.ctas.production}</Link>
        </div>
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

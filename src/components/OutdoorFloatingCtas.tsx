'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OutdoorFloatingCtas() {
  const [showDesktopCta, setShowDesktopCta] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('outdoor-hero');
    const form = document.getElementById('outdoor-form-section');

    if (!hero || !form) return;

    let heroPassed = false;
    let formVisible = false;

    const applyState = () => {
      setShowDesktopCta(heroPassed && !formVisible);
    };

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroPassed = !entry.isIntersecting;
        applyState();
      },
      { threshold: 0.1 },
    );

    const formObserver = new IntersectionObserver(
      ([entry]) => {
        formVisible = entry.isIntersecting;
        applyState();
      },
      { threshold: 0.2 },
    );

    heroObserver.observe(hero);
    formObserver.observe(form);

    return () => {
      heroObserver.disconnect();
      formObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed bottom-6 right-6 z-30 hidden lg:block">
        <Link
          href="#outdoor-form-section"
          aria-hidden={!showDesktopCta}
          tabIndex={showDesktopCta ? 0 : -1}
          className={[
            'pointer-events-auto inline-flex rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white no-underline',
            'shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-xl',
            'ring-1 ring-red-400/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
            showDesktopCta ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
          ].join(' ')}
        >
          Получить расчет
        </Link>
      </div>

      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] right-3 z-30 md:hidden">
        <div className="rounded-full border border-neutral-300 bg-white/95 p-1.5 shadow-xl backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
          <div className="flex items-center gap-1.5">
            <a
              href="tel:+79887317404"
              className="rounded-full border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-800 no-underline transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Позвонить
            </a>
            <Link
              href="#outdoor-form-section"
              className="rounded-full bg-red-600 px-3.5 py-2 text-xs font-semibold text-white no-underline ring-1 ring-red-400/80 shadow-[0_0_18px_rgba(239,68,68,0.2)] transition-all active:scale-95"
            >
              Расчет
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

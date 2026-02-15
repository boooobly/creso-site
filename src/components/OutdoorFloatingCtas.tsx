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
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <Link
          href="#outdoor-lead-form"
          aria-hidden={!showDesktopCta}
          tabIndex={showDesktopCta ? 0 : -1}
          className={[
            'inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white no-underline',
            'shadow-xl transition-all hover:scale-[1.05] hover:bg-red-500',
            'ring-1 ring-red-400/80 shadow-[0_0_24px_rgba(239,68,68,0.25)]',
            showDesktopCta ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4',
          ].join(' ')}
        >
          Получить расчёт
        </Link>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-neutral-300 bg-white/95 p-3 shadow-xl backdrop-blur md:hidden dark:border-neutral-700 dark:bg-neutral-900/95">
        <div className="flex items-center justify-between gap-3">
          <a href="tel:+79887317404" className="text-sm font-medium text-neutral-800 no-underline dark:text-neutral-100">
            Телефон: +7 988 731 74 04
          </a>
          <a
            href="tel:+79887317404"
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white no-underline ring-1 ring-red-400/80 shadow-[0_0_18px_rgba(239,68,68,0.2)] transition-all active:scale-95"
          >
            Позвонить
          </a>
        </div>
      </div>
    </>
  );
}

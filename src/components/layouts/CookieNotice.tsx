'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const COOKIE_NOTICE_STORAGE_KEY = 'credomir_cookie_notice_accepted';
const COOKIE_NOTICE_VISIBILITY_EVENT = 'creso-cookie-notice-visibility';

const notifyFloatingCtaVisibility = (visible: boolean) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent(COOKIE_NOTICE_VISIBILITY_EVENT, {
      detail: { visible },
    }),
  );
};

export default function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isAccepted = localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY) === 'true';
    setIsVisible(!isAccepted);
  }, []);

  useEffect(() => {
    notifyFloatingCtaVisibility(isVisible);

    return () => notifyFloatingCtaVisibility(false);
  }, [isVisible]);

  const acceptNotice = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, 'true');
    }

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] z-50 px-3 sm:bottom-4 sm:px-4"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-sm text-black shadow-xl backdrop-blur-sm dark:border-white/15 dark:bg-neutral-900/95 dark:text-neutral-100 sm:ml-4 sm:mr-auto sm:max-w-lg">
        <p className="m-0 text-sm leading-snug">
          Мы используем cookie и похожие технологии, чтобы сайт работал корректно, сохранял настройки интерфейса и
          помогал нам улучшать сервис.
        </p>

        <div className="flex items-center justify-between gap-3">
          <Link
            href="/privacy"
            className="text-sm font-medium text-red-600 no-underline transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:text-red-400 dark:hover:text-red-300"
          >
            Подробнее
          </Link>

          <button
            type="button"
            onClick={acceptNotice}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/45"
          >
            Понятно
          </button>
        </div>
      </div>
    </aside>
  );
}

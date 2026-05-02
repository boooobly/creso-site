'use client';

import React from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readCookieConsent, writeCookieConsent, type CookieConsentState } from '@/lib/analytics/cookieConsent';

const COOKIE_NOTICE_VISIBILITY_EVENT = 'creso-cookie-notice-visibility';

const notifyFloatingCtaVisibility = (visible: boolean) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(COOKIE_NOTICE_VISIBILITY_EVENT, { detail: { visible } }));
};

export default function CookieNotice() {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const saved = readCookieConsent();
    setConsent(saved);
    setAnalyticsEnabled(saved?.analytics ?? false);
  }, []);

  const isVisible = consent === null || isSettingsOpen;

  useEffect(() => {
    notifyFloatingCtaVisibility(isVisible);
    return () => notifyFloatingCtaVisibility(false);
  }, [isVisible]);

  const saveConsent = (analytics: boolean) => {
    const nextConsent = writeCookieConsent(analytics);
    if (nextConsent) {
      setConsent(nextConsent);
      setAnalyticsEnabled(nextConsent.analytics);
      setIsSettingsOpen(false);
    }
  };

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-4 right-3 z-40 rounded-lg border border-black/10 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-700 shadow-md transition-colors hover:text-black dark:border-white/15 dark:bg-neutral-900/95 dark:text-neutral-200 sm:right-4"
      >
        Настройки cookie
      </button>
    );
  }

  return (
    <aside className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] z-50 px-3 sm:bottom-4 sm:px-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-black/10 bg-white/95 px-4 py-4 text-sm text-black shadow-xl backdrop-blur-sm dark:border-white/15 dark:bg-neutral-900/95 dark:text-neutral-100 sm:ml-4 sm:mr-auto">
        <p className="m-0 leading-snug">Мы используем обязательные cookie/localStorage и опциональную аналитику.</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/privacy" className="text-red-600 no-underline hover:text-red-500 dark:text-red-400">Политика конфиденциальности</Link>
          <Link href="/analytics-consent" className="text-red-600 no-underline hover:text-red-500 dark:text-red-400">О согласии на аналитику</Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => saveConsent(true)} className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500">Принять аналитику</button>
          <button type="button" onClick={() => saveConsent(false)} className="rounded-xl border border-black/15 px-4 py-2 font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10">Отклонить</button>
          <button type="button" onClick={() => setIsSettingsOpen((v) => !v)} className="rounded-xl px-3 py-2 font-medium underline-offset-2 hover:underline">Настроить</button>
        </div>

        {isSettingsOpen && (
          <div className="mt-2 rounded-xl border border-black/10 p-3 dark:border-white/15" data-testid="cookie-settings-panel">
            <label className="mb-3 flex items-center justify-between gap-3">
              <span>Обязательные cookie и localStorage</span>
              <input type="checkbox" checked disabled aria-label="Обязательные cookie и localStorage" />
            </label>
            <label className="mb-3 flex items-center justify-between gap-3">
              <span>Аналитика Яндекс.Метрики</span>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                aria-label="Аналитика Яндекс.Метрики"
              />
            </label>
            <button type="button" onClick={() => saveConsent(analyticsEnabled)} className="rounded-lg bg-black px-3 py-2 text-white dark:bg-white dark:text-black">
              Сохранить выбор
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

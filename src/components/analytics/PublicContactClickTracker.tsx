'use client';

import { useEffect, useState } from 'react';
import { trackContactClick } from '@/lib/analytics/yandexMetrica';
import { COOKIE_CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from '@/lib/analytics/cookieConsent';

function resolveContactType(anchor: HTMLAnchorElement): 'phone' | 'whatsapp' | 'telegram' | 'email' | null {
  const href = anchor.getAttribute('href')?.trim().toLowerCase() ?? '';

  if (!href) return null;
  if (href.startsWith('tel:')) return 'phone';
  if (href.startsWith('mailto:')) return 'email';
  if (href.includes('wa.me') || href.includes('whatsapp.com')) return 'whatsapp';
  if (href.includes('t.me') || href.includes('telegram.me')) return 'telegram';

  return null;
}

export default function PublicContactClickTracker() {
  const [isAnalyticsAllowed, setIsAnalyticsAllowed] = useState(false);

  useEffect(() => {
    setIsAnalyticsAllowed(hasAnalyticsConsent());

    const handleConsentChanged = () => setIsAnalyticsAllowed(hasAnalyticsConsent());
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isAnalyticsAllowed) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const contactType = resolveContactType(anchor);
      if (!contactType) return;

      trackContactClick(contactType);
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
    };
  }, [isAnalyticsAllowed]);

  return null;
}

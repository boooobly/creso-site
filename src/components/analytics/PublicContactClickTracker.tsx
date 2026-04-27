'use client';

import { useEffect } from 'react';
import { trackContactClick } from '@/lib/analytics/yandexMetrica';

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
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
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
  }, []);

  return null;
}

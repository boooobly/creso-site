'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trackHit } from '@/lib/analytics/yandexMetrica';
import { COOKIE_CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from '@/lib/analytics/cookieConsent';

const METRICA_SCRIPT_ID = 'yandex-metrica';

function getCurrentUrl(pathname: string, searchParams: { toString(): string } | null) {
  const search = searchParams?.toString();
  return search ? `${pathname}?${search}` : pathname;
}

function toAbsoluteUrl(url: string) {
  if (typeof window === 'undefined') return null;

  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return null;
  }
}

function getCounterId() {
  const value = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim();
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function YandexMetrica() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const counterId = getCounterId();
  const [isAnalyticsAllowed, setIsAnalyticsAllowed] = useState(false);
  const lastTrackedUrlRef = useRef<string | null>(null);
  const isFirstRenderRef = useRef(true);

  const currentUrl = useMemo(() => getCurrentUrl(pathname, searchParams), [pathname, searchParams]);

  useEffect(() => {
    setIsAnalyticsAllowed(hasAnalyticsConsent());

    const handleConsentChanged = () => setIsAnalyticsAllowed(hasAnalyticsConsent());
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);
  }, []);

  useEffect(() => {
    if (!counterId || !isAnalyticsAllowed) return;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      lastTrackedUrlRef.current = currentUrl;
      return;
    }

    if (lastTrackedUrlRef.current === currentUrl) return;

    const absoluteUrl = toAbsoluteUrl(currentUrl);
    if (!absoluteUrl) return;

    trackHit(absoluteUrl);
    lastTrackedUrlRef.current = currentUrl;
  }, [counterId, currentUrl, isAnalyticsAllowed]);

  if (!counterId || !isAnalyticsAllowed) {
    return null;
  }

  return (
    <>
      <Script id={METRICA_SCRIPT_ID} strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {
              if (document.scripts[j].src === r) { return; }
            }
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

          ym(${counterId}, 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            defer: true
          });

          ym(${counterId}, 'hit', window.location.href);
        `}
      </Script>
      <noscript>
        <div>
          <img src={`https://mc.yandex.ru/watch/${counterId}`} style={{ position: 'absolute', left: '-9999px' }} alt="" />
        </div>
      </noscript>
    </>
  );
}

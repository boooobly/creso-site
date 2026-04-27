'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { trackHit } from '@/lib/analytics/yandexMetrica';

const METRICA_SCRIPT_ID = 'yandex-metrica';

function getCurrentUrl(pathname: string, searchParams: ReadonlyURLSearchParams | null) {
  const search = searchParams?.toString();
  return search ? `${pathname}?${search}` : pathname;
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
  const lastTrackedUrlRef = useRef<string | null>(null);
  const isFirstRenderRef = useRef(true);

  const currentUrl = useMemo(() => getCurrentUrl(pathname, searchParams), [pathname, searchParams]);

  useEffect(() => {
    if (!counterId) return;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      lastTrackedUrlRef.current = currentUrl;
      return;
    }

    if (lastTrackedUrlRef.current === currentUrl) return;

    trackHit(currentUrl);
    lastTrackedUrlRef.current = currentUrl;
  }, [counterId, currentUrl]);

  if (!counterId) {
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
            ssr: true,
            webvisor: true,
            clickmap: true,
            ecommerce: 'dataLayer',
            referrer: document.referrer,
            url: location.href,
            accurateTrackBounce: true,
            trackLinks: true
          });
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

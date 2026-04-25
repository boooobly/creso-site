'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const COOKIE_NOTICE_VISIBILITY_EVENT = 'creso-cookie-notice-visibility';

type RouteFloatingCtaConfig = {
  href: string;
  label: string;
};

const ROUTE_CONFIG: Record<string, RouteFloatingCtaConfig> = {
  '/': { href: '#lead-form', label: 'Оставить заявку' },
  '/wide-format-printing': { href: '#wide-format-form', label: 'Оставить заявку' },
  '/plotter-cutting': { href: '#plotter-request', label: 'Оставить заявку' },
  '/heat-transfer': { href: '#tshirts-order', label: 'Оставить заявку' },
  '/services/mugs': { href: '#mugs-order', label: 'Оставить заявку' },
  '/services/stands': { href: '#stands-lead-form', label: 'Оставить заявку' },
  '/outdoor-advertising': { href: '#outdoor-form-section', label: 'Оставить заявку' },
  '/print': { href: '#print-order-form', label: 'Оставить заявку' },
  '/milling': { href: '#milling-order', label: 'Оставить заявку' },
};

export default function FloatingLeadCta() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isCookieNoticeVisible, setIsCookieNoticeVisible] = useState(false);

  const config = useMemo(() => ROUTE_CONFIG[pathname ?? ''], [pathname]);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCookieNoticeVisibility = (event: Event) => {
      const customEvent = event as CustomEvent<{ visible?: boolean }>;
      setIsCookieNoticeVisible(Boolean(customEvent.detail?.visible));
    };

    window.addEventListener(COOKIE_NOTICE_VISIBILITY_EVENT, handleCookieNoticeVisibility as EventListener);

    return () => {
      window.removeEventListener(COOKIE_NOTICE_VISIBILITY_EVENT, handleCookieNoticeVisibility as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);
    updateIsMobile();

    mediaQuery.addEventListener('change', updateIsMobile);
    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  useEffect(() => {
    if (!config || !isMobile) {
      setShouldShow(false);
      return;
    }

    const target = document.querySelector<HTMLElement>(config.href);
    if (!target) {
      setShouldShow(false);
      return;
    }

    const trackedElements = Array.from(document.querySelectorAll<HTMLElement>('[data-floating-cta-hide]')).filter(
      (element) => element.offsetParent !== null,
    );

    const hasTrackedElements = trackedElements.length > 0;
    if (!hasTrackedElements) {
      setShouldShow(false);
      return;
    }

    const visibleElements = new Set<Element>();

    const updateVisibility = () => {
      setShouldShow(visibleElements.size === 0);
    };

    const supportsIntersectionObserver = typeof IntersectionObserver !== 'undefined';

    if (!supportsIntersectionObserver) {
      const handleFallback = () => {
        const viewportHeight = window.innerHeight;
        const anyVisible = trackedElements.some((element) => {
          const rect = element.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < viewportHeight;
        });
        setShouldShow(!anyVisible);
      };

      handleFallback();
      window.addEventListener('scroll', handleFallback, { passive: true });
      window.addEventListener('resize', handleFallback);

      return () => {
        window.removeEventListener('scroll', handleFallback);
        window.removeEventListener('resize', handleFallback);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleElements.add(entry.target);
          } else {
            visibleElements.delete(entry.target);
          }
        });
        updateVisibility();
      },
      { threshold: 0.2 },
    );

    trackedElements.forEach((element) => observer.observe(element));
    updateVisibility();

    return () => observer.disconnect();
  }, [config, isMobile, pathname]);

  if (!config || !isMobile) return null;

  const isCtaVisible = shouldShow && !isCookieNoticeVisible;

  return (
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] right-4 z-40">
      <Link
        href={config.href}
        aria-hidden={!isCtaVisible}
        tabIndex={isCtaVisible ? 0 : -1}
        className={[
          'pointer-events-auto inline-flex min-h-11 items-center justify-center rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white no-underline',
          'shadow-[0_12px_26px_rgba(220,38,38,0.28)] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/45',
          isCtaVisible ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-3 opacity-0',
        ].join(' ')}
      >
        {config.label}
      </Link>
    </div>
  );
}

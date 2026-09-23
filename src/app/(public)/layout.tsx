import { getPublicSiteSettings } from '@/lib/site-settings';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import JsonLd from '@/components/seo/JsonLd';
import SiteHeader from '@/components/layouts/SiteHeader';
import SiteFooter from '@/components/layouts/SiteFooter';
import FloatingLeadCta from '@/components/layouts/FloatingLeadCta';
import CookieNotice from '@/components/layouts/CookieNotice';
import YandexMetrica from '@/components/analytics/YandexMetrica';
import PublicContactClickTracker from '@/components/analytics/PublicContactClickTracker';
import { buildLocalBusinessJsonLd, buildWebSiteJsonLd } from '@/lib/seo';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getPublicSiteSettings();
  return (
    <>
      <JsonLd data={buildLocalBusinessJsonLd(settings)} />
      <JsonLd data={buildWebSiteJsonLd()} />
      <Suspense fallback={null}>
        <YandexMetrica />
      </Suspense>
      <PublicContactClickTracker />
      <div className="public-site-shell">
        <a href="#main-content" className="skip-link">Перейти к содержимому</a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="main-layout public-layout-main container min-w-0 py-6 sm:py-8">{children}</main>
        <FloatingLeadCta />
        <CookieNotice />
        <SiteFooter />
      </div>
    </>
  );
}

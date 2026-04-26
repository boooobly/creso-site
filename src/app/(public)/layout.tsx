import type { ReactNode } from 'react';
import JsonLd from '@/components/seo/JsonLd';
import SiteHeader from '@/components/layouts/SiteHeader';
import SiteFooter from '@/components/layouts/SiteFooter';
import FloatingLeadCta from '@/components/layouts/FloatingLeadCta';
import CookieNotice from '@/components/layouts/CookieNotice';
import { buildLocalBusinessJsonLd, buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildLocalBusinessJsonLd()} />
      <JsonLd data={buildWebSiteJsonLd()} />
      <div className="public-site-shell">
        <SiteHeader />
        <main className="main-layout public-layout-main container min-w-0 py-6 sm:py-8">{children}</main>
        <FloatingLeadCta />
        <CookieNotice />
        <SiteFooter />
      </div>
    </>
  );
}

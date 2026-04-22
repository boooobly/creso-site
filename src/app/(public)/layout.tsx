import type { ReactNode } from 'react';
import SiteHeader from '@/components/layouts/SiteHeader';
import SiteFooter from '@/components/layouts/SiteFooter';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-site-shell">
      <SiteHeader />
      <main className="main-layout public-layout-main container py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}

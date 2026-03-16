import type { ReactNode } from 'react';
import SiteHeader from '@/components/layouts/SiteHeader';
import SiteFooter from '@/components/layouts/SiteFooter';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="main-layout container py-8">{children}</main>
      <SiteFooter />
    </>
  );
}

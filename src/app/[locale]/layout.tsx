import '../styles.css';
import '@/styles/globals.css';
import { defaultMetadata } from '@/lib/seo';
import SiteHeader from '@/components/layouts/SiteHeader';
import SiteFooter from '@/components/layouts/SiteFooter';
import { locales, type Locale } from '@/i18n';
import type { Metadata } from 'next';

export async function generateStaticParams() { return locales.map((l) => ({ locale: l })); }
export const dynamicParams = false;

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({ params, children }: { params: { locale: Locale }, children: React.ReactNode }) {
  const { locale } = params;
  return (
    <html lang={locale}>
      <body>
        <SiteHeader />
        <main className="container py-8">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}

import './styles.css';
import '@/styles/globals.css';
import { defaultMetadata } from '@/lib/seo';
import SiteHeader from '@/components/layouts/SiteHeader';
import SiteFooter from '@/components/layouts/SiteFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = defaultMetadata;

const themeInitScript = `(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (_) {}
})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-white dark:bg-neutral-950">
        <SiteHeader />
        <main className="container py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

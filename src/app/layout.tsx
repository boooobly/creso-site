import './styles.css';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import { defaultMetadata } from '@/lib/seo';
import SiteHeader from '@/components/layouts/SiteHeader';
import SiteFooter from '@/components/layouts/SiteFooter';

export const metadata: Metadata = defaultMetadata;

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-onest',
  display: 'swap'
});

const themeInitScript = `(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (_) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${onest.variable} font-sans bg-white dark:bg-neutral-950`}>
        <SiteHeader />
        <main className="main-layout container py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

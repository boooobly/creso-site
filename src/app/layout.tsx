import './styles.css';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { getDefaultMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getDefaultMetadata();
}

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
      <body style={{ '--font-onest': 'ui-sans-serif' } as React.CSSProperties} className="font-sans bg-white dark:bg-neutral-950">
        {children}
      </body>
    </html>
  );
}

'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { Languages } from 'lucide-react';
import { messages as ruMessages } from '@/i18n/ru';
import { messages as enMessages } from '@/i18n/en';

const nav: Array<{ href: string; key: keyof typeof ruMessages.nav }> = [
  { href: '/baget', key: 'baget' },
  { href: '/services', key: 'services' },
  { href: '/production', key: 'production' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/blog', key: 'blog' },
  { href: '/contacts', key: 'contacts' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: Locale }>();
  const t = locale === 'en' ? enMessages : ruMessages;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="container flex items-center justify-between py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="CredoMir" className="h-8 w-auto" />
        </Link>
        <nav className="hidden md:flex gap-5">
          {nav.map((n) => {
            const href = `/${locale}${n.href}`;
            const active = pathname === href;
            return (
              <Link
                key={n.href}
                href={href}
                className={
                  'no-underline text-sm font-medium hover:text-[var(--brand-red)] ' +
                  (active ? 'text-[var(--brand-red)]' : 'text-neutral-700')
                }
              >
                <span>{t.nav[n.key]}</span>
              </Link>
            );
          })}
        </nav>
        <LangSwitcher />
      </div>
    </header>
  );
}

function LangSwitcher() {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: Locale }>();
  return (
    <div className="flex items-center gap-2">
      <Languages className="size-5 text-neutral-700" />
      {locales.map((l) => {
        const href = `/${l}${pathname?.slice(3) ?? ''}`;
        return (
          <Link
            key={l}
            href={href}
            className={
              'uppercase text-xs no-underline px-2 py-1 rounded ' +
              (l === locale ? 'bg-neutral-200' : 'hover:bg-neutral-100')
            }
          >
            {l}
          </Link>
        );
      })}
    </div>
  );
}

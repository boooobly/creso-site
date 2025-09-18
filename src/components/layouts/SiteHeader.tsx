'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { Languages } from 'lucide-react';

const nav = [
  { href: '/baget', labelKey: 'nav.baget' },
  { href: '/services', labelKey: 'nav.services' },
  { href: '/production', labelKey: 'nav.production' },
  { href: '/portfolio', labelKey: 'nav.portfolio' },
  { href: '/blog', labelKey: 'nav.blog' },
  { href: '/contacts', labelKey: 'nav.contacts' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: Locale }>();
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
                <span data-i18n={n.labelKey}>{n.href}</span>
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
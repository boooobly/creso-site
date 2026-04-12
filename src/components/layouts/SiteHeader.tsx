'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, Moon, Sun } from 'lucide-react';
import { messages } from '@/lib/messages';

type NavItem = {
  href: string;
  label: string;
  key?: keyof typeof messages.nav;
};

const serviceDropdownItems: Array<{ label: string; href: string }> = [
  { label: 'Багет', href: '/baget' },
  { label: 'Широкоформатная печать', href: '/wide-format-printing' },
  { label: 'Плоттерная резка', href: '/plotter-cutting' },
  { label: 'Печать на футболках', href: '/heat-transfer' },
  { label: 'Печать на кружках', href: '/services/mugs' },
  { label: 'Изготовление стендов', href: '/services/stands' },
  { label: 'Наружная реклама', href: '/outdoor-advertising' },
  { label: 'Визитки и флаеры', href: '/print' },
  { label: 'Фрезеровка листовых материалов', href: '/milling' },
];

const nav: NavItem[] = [
  { href: '/', label: 'Главная' },
  { href: '/services', label: messages.nav.services, key: 'services' },
  { href: '/production', label: messages.nav.production, key: 'production' },
  { href: '/portfolio', label: messages.nav.portfolio, key: 'portfolio' },
  { href: '/reviews', label: messages.nav.reviews, key: 'reviews' },
  { href: '/contacts', label: messages.nav.contacts, key: 'contacts' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    let scrolledState = false;

    const evaluateScroll = () => {
      const scrollY = window.scrollY;
      let nextState = scrolledState;

      if (!scrolledState && scrollY > 30) {
        nextState = true;
      } else if (scrolledState && scrollY < 10) {
        nextState = false;
      }

      if (nextState !== scrolledState) {
        scrolledState = nextState;
        setIsScrolled((prev) => (prev === nextState ? prev : nextState));
      }

      rafId = null;
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(evaluateScroll);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    setIsServicesMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800/90 dark:bg-neutral-950/80 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className={`container flex items-center justify-between transition-all duration-200 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image
            src="/images/logo-light.png"
            alt="CredoMir logo"
            width={160}
            height={60}
            className={`block h-10 w-auto transition-all duration-200 dark:hidden ${isScrolled ? 'h-8' : 'h-10'}`}
          />
          <Image
            src="/images/logo-dark.png"
            alt="CredoMir logo"
            width={160}
            height={60}
            className={`hidden h-10 w-auto transition-all duration-200 dark:block ${isScrolled ? 'h-8' : 'h-10'}`}
          />
        </Link>
        <nav className="hidden md:flex">
          <ul className="flex items-center gap-5">
            {nav.map((n) => {
              if (n.href === '/services') {
                const isServicesActive = pathname === '/services' || serviceDropdownItems.some((item) => pathname === item.href);

                return (
                  <li
                    key={n.href}
                    className="group relative"
                    onMouseEnter={() => setIsServicesMenuOpen(true)}
                    onMouseLeave={() => setIsServicesMenuOpen(false)}
                    onFocus={() => setIsServicesMenuOpen(true)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setIsServicesMenuOpen(false);
                      }
                    }}
                  >
                    <Link
                      href={n.href}
                      onClick={() => setIsServicesMenuOpen(false)}
                      className={
                        'inline-flex items-center gap-1 no-underline text-sm font-medium transition-colors hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:text-[var(--brand-red)] ' +
                        (isServicesActive ? 'text-[var(--brand-red)]' : 'text-neutral-700 dark:text-neutral-300')
                      }
                      aria-haspopup="menu"
                      aria-expanded={isServicesMenuOpen}
                    >
                      <span>{n.label}</span>
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-150 ${isServicesMenuOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </Link>
                    <div
                      className={`absolute left-1/2 top-full z-50 w-[320px] -translate-x-1/2 pt-2 transition duration-150 ${
                        isServicesMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                      }`}
                    >
                      <ul
                        className="rounded-xl border border-neutral-200/80 bg-white/95 p-2 shadow-lg shadow-black/10 backdrop-blur dark:border-neutral-800/90 dark:bg-neutral-900/95 dark:shadow-black/40"
                        role="menu"
                        aria-label="Услуги"
                      >
                        {serviceDropdownItems.map((item) => {
                          const active = pathname === item.href;

                          return (
                            <li key={item.href} role="none">
                              <Link
                                href={item.href}
                                onClick={() => setIsServicesMenuOpen(false)}
                                role="menuitem"
                                className={
                                  'block rounded-lg px-3 py-2 text-sm no-underline transition-colors focus-visible:outline-none ' +
                                  (active
                                    ? 'bg-[color:var(--brand-red)]/10 text-[var(--brand-red)] dark:bg-[color:var(--brand-red)]/15'
                                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-[var(--brand-red)] dark:text-neutral-200 dark:hover:bg-neutral-800/90')
                                }
                              >
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              }

              const active = pathname === n.href;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={
                      'no-underline text-sm font-medium hover:text-[var(--brand-red)] ' +
                      (active ? 'text-[var(--brand-red)]' : 'text-neutral-700 dark:text-neutral-300')
                    }
                  >
                    <span>{n.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 bg-white/80 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
      aria-label="Переключить тему"
      disabled={!mounted}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

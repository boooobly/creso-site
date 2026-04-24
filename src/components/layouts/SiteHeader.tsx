'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const previousMobileMenuState = useRef(false);
  const isServicesActive = pathname === '/services' || serviceDropdownItems.some((item) => pathname === item.href);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

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
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (previousMobileMenuState.current && !isMobileMenuOpen) {
      mobileMenuButtonRef.current?.focus();
    }

    previousMobileMenuState.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  const mobileMenuOverlay = (
    <div
      className={`fixed inset-0 z-[60] md:hidden ${
        isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!isMobileMenuOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-neutral-950/55 transition-opacity duration-200 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Закрыть меню"
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside
        id="mobile-site-menu"
        className={`absolute right-0 top-0 flex h-dvh w-[min(22rem,calc(100%_-_0.75rem_-_env(safe-area-inset-right,0px)))] max-w-full flex-col border-l border-neutral-200 bg-white pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)] pt-[env(safe-area-inset-top,0px)] shadow-2xl transition-transform duration-200 dark:border-neutral-800 dark:bg-neutral-950 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Навигация по сайту"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Меню</span>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)]/35 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            aria-label="Закрыть меню"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 pb-5" aria-label="Мобильная навигация">
          <ul className="space-y-1.5">
            {nav.map((item) => {
              if (item.href === '/services') {
                return (
                  <li key={item.href} className="rounded-xl border border-neutral-200/90 bg-neutral-50/80 p-1.5 dark:border-neutral-800/90 dark:bg-neutral-900/60">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={item.href}
                        className={`flex min-h-11 flex-1 items-center rounded-lg px-3 text-sm font-medium no-underline transition-colors ${
                          isServicesActive
                            ? 'text-[var(--brand-red)]'
                            : 'text-neutral-700 hover:text-[var(--brand-red)] dark:text-neutral-300'
                        }`}
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setIsMobileServicesOpen((prev) => !prev)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)]/35 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        aria-expanded={isMobileServicesOpen}
                        aria-controls="mobile-services-list"
                        aria-label="Показать услуги"
                      >
                        <ChevronDown className={`size-4 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {isMobileServicesOpen ? (
                      <ul id="mobile-services-list" className="mt-1.5 space-y-1.5 px-1 pb-1" aria-label="Список услуг">
                        {serviceDropdownItems.map((service) => {
                          const isServiceActive = pathname === service.href;
                          return (
                            <li key={service.href}>
                              <Link
                                href={service.href}
                                className={`flex min-h-11 min-w-0 items-center rounded-lg px-3 text-sm no-underline transition-colors ${
                                  isServiceActive
                                    ? 'bg-[color:var(--brand-red)]/10 text-[var(--brand-red)] dark:bg-[color:var(--brand-red)]/15'
                                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-[var(--brand-red)] dark:text-neutral-300 dark:hover:bg-neutral-800'
                                }`}
                              >
                                <span className="text-wrap-safe">{service.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              }

              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex min-h-11 min-w-0 items-center rounded-lg px-3 text-sm font-medium no-underline transition-colors ${
                      isActive
                        ? 'bg-[color:var(--brand-red)]/10 text-[var(--brand-red)] dark:bg-[color:var(--brand-red)]/15'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-[var(--brand-red)] dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="text-wrap-safe">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <ThemeToggle className="h-11 w-11" />
        </div>
      </aside>
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800/90 dark:bg-neutral-950/80 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div
        className={`container flex items-center justify-between gap-2 transition-all duration-200 ${
          isScrolled ? 'py-2.5 md:py-2' : 'py-3 md:py-4'
        }`}
      >
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image
            src="/images/logo-light.png"
            alt="CredoMir logo"
            width={160}
            height={60}
            className={`block h-9 w-auto max-w-[140px] transition-all duration-200 dark:hidden sm:max-w-none md:h-10 ${isScrolled ? 'md:h-8' : 'md:h-10'}`}
          />
          <Image
            src="/images/logo-dark.png"
            alt="CredoMir logo"
            width={160}
            height={60}
            className={`hidden h-9 w-auto max-w-[140px] transition-all duration-200 dark:block sm:max-w-none md:h-10 ${isScrolled ? 'md:h-8' : 'md:h-10'}`}
          />
        </Link>
        <nav className="hidden md:flex">
          <ul className="flex items-center gap-5">
            {nav.map((n) => {
              if (n.href === '/services') {
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
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white/80 text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-red)]/35 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800 md:hidden"
            aria-label="Открыть меню"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
      {isClientMounted ? createPortal(mobileMenuOverlay, document.body) : null}
    </header>
  );
}

function ThemeToggle({ className = 'h-8 w-8' }: { className?: string }) {
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
      className={`inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white/80 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800 ${className}`}
      aria-label="Переключить тему"
      disabled={!mounted}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

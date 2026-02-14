'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { messages } from '@/lib/messages';

const nav: Array<{ href: string; key: keyof typeof messages.nav }> = [
  { href: '/baget', key: 'baget' },
  { href: '/services', key: 'services' },
  { href: '/production', key: 'production' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/blog', key: 'blog' },
  { href: '/contacts', key: 'contacts' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <header
      className={`sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-black/70 ${
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
        <nav className="hidden gap-5 md:flex">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  'no-underline text-sm font-medium hover:text-[var(--brand-red)] ' +
                  (active ? 'text-[var(--brand-red)]' : 'text-neutral-700 dark:text-neutral-300')
                }
              >
                <span>{messages.nav[n.key]}</span>
              </Link>
            );
          })}
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      aria-label="Переключить тему"
      disabled={!mounted}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

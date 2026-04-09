import Image from 'next/image';
import Link from 'next/link';
import { getPublicSiteSettings } from '@/lib/site-settings';

const navItems = [
  { label: 'Багет', href: '/baget' },
  { label: 'Услуги', href: '/services' },
  { label: 'Производство', href: '/production' },
  { label: 'Портфолио', href: '/portfolio' },
  { label: 'Отзывы', href: '/reviews' },
  { label: 'Контакты', href: '/contacts' },
];

const trustPoints = ['Собственное производство и монтаж', 'Работа по договору и прозрачная смета', 'Соблюдение согласованных сроков'];

function toExternalLink(value: string, type: 'telegram' | 'whatsapp') {
  const trimmed = value.trim();
  if (!trimmed) return '#';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  if (type === 'telegram') {
    return trimmed.startsWith('@') ? `https://t.me/${trimmed.slice(1)}` : `https://t.me/${trimmed}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '#';
}

export default async function SiteFooter() {
  const settings = await getPublicSiteSettings();
  const telegramHref = toExternalLink(settings.telegram, 'telegram');
  const whatsappHref = toExternalLink(settings.whatsapp, 'whatsapp');

  return (
    <footer className="mt-12 border-t border-neutral-200/90 bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-700 dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-950 dark:text-neutral-300">
      <div className="container py-10 md:py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.9fr] lg:gap-6">
          <section className="card-structured space-y-4 border-neutral-200 bg-white/75 md:p-6 dark:border-neutral-800 dark:bg-neutral-900/70" aria-labelledby="footer-contacts">
            <div className="space-y-2.5">
              <Link href="/" className="inline-flex no-underline" aria-label="На главную">
                <Image src="/images/logo-light.png" alt="CredoMir logo" width={222} height={78} className="block h-14 w-auto dark:hidden" />
                <Image src="/images/logo-dark.png" alt="CredoMir logo" width={222} height={78} className="hidden h-14 w-auto dark:block" />
              </Link>
              <p className="t-small text-neutral-600 dark:text-neutral-400">{settings.address}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={`tel:${settings.phoneHref}`}
                className="group rounded-xl border border-[color:var(--brand-red)]/35 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-800 no-underline shadow-[0_8px_18px_-18px_rgba(212,28,28,0.9)] transition-colors hover:border-[color:var(--brand-red)] hover:text-[var(--brand-red)] dark:border-[color:var(--brand-red)]/45 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <span className="block text-[11px] uppercase tracking-[0.09em] text-[var(--brand-red)]/85 transition-colors group-hover:text-[var(--brand-red)] dark:text-[var(--brand-red)]/80">
                  Телефон
                </span>
                <span className="mt-0.5 block">{settings.phone}</span>
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="group rounded-xl border border-[color:var(--brand-red)]/35 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-800 no-underline shadow-[0_8px_18px_-18px_rgba(212,28,28,0.9)] transition-colors hover:border-[color:var(--brand-red)] hover:text-[var(--brand-red)] dark:border-[color:var(--brand-red)]/45 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <span className="block text-[11px] uppercase tracking-[0.09em] text-[var(--brand-red)]/85 transition-colors group-hover:text-[var(--brand-red)] dark:text-[var(--brand-red)]/80">
                  WhatsApp
                </span>
                <span className="mt-0.5 block">{settings.whatsapp}</span>
              </a>
              <a
                href={telegramHref}
                target="_blank"
                rel="noreferrer"
                className="group rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium no-underline transition-colors hover:border-[color:var(--brand-red)]/60 hover:text-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900"
              >
                <span className="block text-[11px] uppercase tracking-[0.09em] text-neutral-500 transition-colors group-hover:text-[var(--brand-red)]/90 dark:text-neutral-400">
                  Telegram
                </span>
                <span className="mt-0.5 block">{settings.telegram}</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="group rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium no-underline transition-colors hover:border-[color:var(--brand-red)]/60 hover:text-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900"
              >
                <span className="block text-[11px] uppercase tracking-[0.09em] text-neutral-500 transition-colors group-hover:text-[var(--brand-red)]/90 dark:text-neutral-400">
                  Email
                </span>
                <span className="mt-0.5 block">{settings.email}</span>
              </a>
            </div>
          </section>

          <section className="card-structured space-y-3.5 md:p-6" aria-labelledby="footer-company">
            <h3 id="footer-company" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              О компании
            </h3>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold tracking-[0.01em] text-neutral-900 dark:text-neutral-100">{settings.companyName}</p>
              <p className="t-small text-neutral-600 dark:text-neutral-400">{settings.companyShortInfo}</p>
            </div>
            <div className="space-y-1.5 border-t border-neutral-200 pt-2.5 dark:border-neutral-800">
              <p className="t-small font-medium text-neutral-700 dark:text-neutral-300">Режим работы: {settings.workingHours}</p>
              {settings.vkLink ? (
                <p className="t-small text-neutral-600 dark:text-neutral-400">
                  VK:{' '}
                  <a className="font-medium text-neutral-800 underline decoration-neutral-400/80 transition-colors hover:text-[var(--brand-red)] dark:text-neutral-200" href={settings.vkLink} target="_blank" rel="noreferrer">
                    Официальная страница
                  </a>
                </p>
              ) : null}
            </div>
            <ul className="space-y-1.5 border-t border-neutral-200 pt-2.5 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="card-dot mt-1.5" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-structured space-y-3.5 md:col-span-2 md:p-6 lg:col-span-1" aria-labelledby="footer-navigation">
            <h3 id="footer-navigation" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Навигация
            </h3>
            <nav aria-label="Навигация по сайту" className="grid gap-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-1.5 leading-5 no-underline transition-colors hover:bg-white hover:text-[var(--brand-red)] dark:hover:bg-neutral-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 border-t border-neutral-200/90 pt-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400 md:flex-row md:items-center md:justify-between">
          <p className="leading-5">{settings.footerText}</p>
          <Link href="/privacy" className="w-fit font-medium no-underline transition-colors hover:text-[var(--brand-red)]">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}

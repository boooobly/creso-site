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
  { label: 'Политика конфиденциальности', href: '/privacy' },
];

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

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
      <div className="container py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr] md:gap-8 lg:gap-12">
          <div className="space-y-2.5 text-sm">
            <Link href="/" className="inline-flex no-underline">
              <Image src="/images/logo-light.png" alt="CredoMir logo" width={180} height={64} className="block h-12 w-auto dark:hidden" />
              <Image src="/images/logo-dark.png" alt="CredoMir logo" width={180} height={64} className="hidden h-12 w-auto dark:block" />
            </Link>
            <p>{settings.address}</p>
            <p>
              Telegram:{' '}
              <a className="underline" href={telegramHref} target="_blank" rel="noreferrer">
                {settings.telegram}
              </a>
            </p>
            <p>WhatsApp: {settings.whatsapp}</p>
            <p>Телефон: {settings.phone}</p>
            <p>Email: {settings.email}</p>
          </div>

          <div className="space-y-2.5 text-sm">
            <h3 className="text-base font-semibold">О компании</h3>
            <p>{settings.companyName}</p>
            <p>{settings.companyShortInfo}</p>
            <p>Режим работы: {settings.workingHours}</p>
            {settings.vkLink ? (
              <p>
                VK: <a className="underline" href={settings.vkLink} target="_blank" rel="noreferrer">Ссылка</a>
              </p>
            ) : null}
          </div>

          <div className="space-y-2.5 text-sm">
            <h3 className="text-base font-semibold">Навигация</h3>
            <nav className="mt-2 flex flex-col gap-2.5">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="no-underline hover:text-[var(--brand-red)]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-5 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          {settings.footerText}
        </div>
      </div>
    </footer>
  );
}

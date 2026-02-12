import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import type { Locale } from '@/i18n';

export default function SiteFooter({ locale }: { locale: Locale }) {
  const isEn = locale === 'en';

  return (
    <footer className="mt-16 border-t bg-white">
      <div className="container py-8 grid gap-6 md:grid-cols-3">
        <div>
          <img src="/logo.svg" alt="CredoMir" className="h-8 w-auto" />
          <p className="mt-3 text-sm text-neutral-600">
            {BRAND.name}. {BRAND.city}. {BRAND.address}
          </p>
        </div>
        <div className="text-sm">
          <p>Тел: {BRAND.phone}</p>
          <p>E-mail: {BRAND.email}</p>
          <Link href={BRAND.yandexRoute} className="text-[var(--brand-red)] no-underline" target="_blank">
            {isEn ? 'Route in Yandex Maps' : 'Маршрут в Яндекс.Картах'}
          </Link>
        </div>
        <div className="text-sm">
          <Link href={`/${locale}/privacy`} className="no-underline hover:underline">
            {isEn ? 'Privacy Policy' : 'Политика конфиденциальности'}
          </Link>
          <p className="text-neutral-500 mt-2">© {new Date().getFullYear()} {BRAND.name}</p>
        </div>
      </div>
    </footer>
  );
}

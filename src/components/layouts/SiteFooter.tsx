import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import type { Locale } from '@/i18n';

export default function SiteFooter({ locale }: { locale: Locale }) {
  const isEn = locale === 'en';

  return (
    <footer className="mt-16 border-t bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container grid gap-6 py-8 md:grid-cols-3">
        <div>
          <img src="/logo.svg" alt="CredoMir" className="h-8 w-auto" />
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
            {BRAND.name}. {BRAND.city}. {BRAND.address}
          </p>
        </div>
        <div className="text-sm space-y-1">
          <p>Тел: {BRAND.phone}</p>
          <p>E-mail: {BRAND.email}</p>
          <Link href={BRAND.yandexRoute} className="text-[var(--brand-red)] no-underline" target="_blank">
            {isEn ? 'Route in Yandex Maps' : 'Маршрут в Яндекс.Картах'}
          </Link>
          <p className="pt-2">ИП [REPLACE_WITH_FULL_NAME]</p>
          <p>ИНН 263106597812</p>
          <p>ОГРНИП 322265100113550</p>
        </div>
        <div className="text-sm">
          <Link href="/privacy" className="no-underline hover:underline">
            Политика конфиденциальности
          </Link>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">© {new Date().getFullYear()} {BRAND.name}</p>
        </div>
      </div>
    </footer>
  );
}

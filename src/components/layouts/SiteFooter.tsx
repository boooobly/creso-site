import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  { key: 'Багет', href: '/baget' },
  { key: 'Услуги', href: '/services' },
  { key: 'Производство', href: '/production' },
  { key: 'Портфолио', href: '/portfolio' },
  { key: 'Блог', href: '/blog' },
  { key: 'Контакты', href: '/contacts' },
  { key: 'Политика конфиденциальности', href: '/privacy' },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex no-underline">
              <Image src="/images/logo-light.png" alt="CredoMir logo" width={180} height={64} className="h-12 w-auto block dark:hidden" />
              <Image src="/images/logo-dark.png" alt="CredoMir logo" width={180} height={64} className="h-12 w-auto hidden dark:block" />
            </Link>
            <p className="mt-4 text-sm">CredoMir</p>
            <p className="text-sm">Невинномысск, ул. Калинина, 106</p>

            <div className="mt-4 space-y-1 text-sm">
              <a href="https://t.me/Credomir" target="_blank" rel="noreferrer" className="hover:text-[var(--brand-red)] no-underline">
                Telegram: @Credomir
              </a>
              <a href="tel:+79887317404" className="block hover:text-[var(--brand-red)] no-underline">
                MAX: +7 988 731 74 04
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">Реквизиты</h3>
            <div className="mt-4 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <p>ИП Кошелева Валентина Валерьевна</p>
              <p>ИНН 263106597812</p>
              <p>ОГРНИП 322265100113550</p>
              <p>
                Email:{' '}
                <a href="mailto:credomir26@mail.ru" className="hover:text-[var(--brand-red)] no-underline">
                  credomir26@mail.ru
                </a>
              </p>
              <p>
                Тел:{' '}
                <a href="tel:+79887317404" className="hover:text-[var(--brand-red)] no-underline">
                  +7 988 731 74 04
                </a>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">Навигация</h3>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="no-underline hover:text-[var(--brand-red)]">
                  {item.key}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-5 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          <p>© 2026 CredoMir</p>
          <p>Все права защищены</p>
        </div>
      </div>
    </footer>
  );
}

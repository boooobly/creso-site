import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  { label: 'Багет', href: '/baget' },
  { label: 'Услуги', href: '/services' },
  { label: 'Производство', href: '/production' },
  { label: 'Портфолио', href: '/portfolio' },
  { label: 'Блог', href: '/blog' },
  { label: 'Контакты', href: '/contacts' },
  { label: 'Политика конфиденциальности', href: '/privacy' },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-2 text-sm">
            <Link href="/" className="inline-flex no-underline">
              <Image src="/images/logo-light.png" alt="CredoMir logo" width={180} height={64} className="block h-12 w-auto dark:hidden" />
              <Image src="/images/logo-dark.png" alt="CredoMir logo" width={180} height={64} className="hidden h-12 w-auto dark:block" />
            </Link>
            <p>Невинномысск, ул. Калинина, 106</p>
            <p>Telegram: @Credomir</p>
            <p>MAX phone: +7 988 731 74 04</p>
          </div>

          <div className="space-y-2 text-sm">
            <h3 className="text-base font-semibold">Реквизиты</h3>
            <p>ИП Кошелева Валентина Валерьевна</p>
            <p>ИНН 263106597812</p>
            <p>ОГРНИП 322265100113550</p>
            <p>Email: credomir26@mail.ru</p>
            <p>Телефон: +7 988 731 74 04</p>
          </div>

          <div className="space-y-2 text-sm">
            <h3 className="text-base font-semibold">Навигация</h3>
            <nav className="mt-2 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="no-underline hover:text-[var(--brand-red)]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-5 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          © 2026 CredoMir. Все права защищены.
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import type { ComponentType } from 'react';
import { Calculator, Clock3, FileCheck2, Mail, MessageCircle, MessageSquare, Package, Phone, Send } from 'lucide-react';
import ContactsLeadCapture from '@/components/ContactsLeadCapture';
import MapSection from '@/components/MapSection';
import { BRAND } from '@/lib/constants';
import { messages } from '@/lib/messages';


type LinkedQuickContact = {
  title: string;
  value: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type HoursQuickContact = {
  title: string;
  lines: string[];
  helper: string;
  icon: ComponentType<{ className?: string }>;
};

const quickContacts: Array<LinkedQuickContact | HoursQuickContact> = [
  { title: 'Позвонить', value: '+7 988 731 74 04', href: 'tel:+79887317404', icon: Phone },
  { title: 'Telegram', value: '@Credomir', href: 'https://t.me/Credomir', icon: Send },
  { title: 'Max Messenger', value: '+7 988 731 74 04', href: 'https://wa.me/79887317404', icon: MessageCircle },
  { title: 'Email', value: 'credomir26@mail.ru', href: 'mailto:credomir26@mail.ru', icon: Mail },
  {
    title: 'График работы',
    lines: ['Пн–Пт: 9:00–17:30', 'Сб–Вс: выходной'],
    helper: 'Отвечаем в рабочее время.',
    icon: Clock3,
  },
];

const trustItems = [
  'ИП Кошелева Валентина Валерьевна',
  'ИНН 263106597812',
  'ОГРНИП 322265100113550',
  'Работаем с физическими и юридическими лицами',
  'Безналичная оплата',
];

const processSteps = [
  {
    title: 'Оставляете заявку',
    description: 'Пишете или звоните, рассказываете задачу и пожелания.',
    icon: MessageSquare,
  },
  {
    title: 'Рассчитываем стоимость',
    description: 'Уточняем материалы, объём работы и подготавливаем расчёт.',
    icon: Calculator,
  },
  {
    title: 'Согласуем макет',
    description: 'Подтверждаем детали, макет и финальные условия перед запуском.',
    icon: FileCheck2,
  },
  {
    title: 'Изготавливаем и передаём',
    description: 'Выполняем заказ и передаём готовую работу. Доставка доступна.',
    icon: Package,
  },
] as const;

export default function ContactsPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="t-h2">Контакты</h1>
        <p className="text-neutral-700 dark:text-neutral-300">Адрес: {BRAND.address}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickContacts.map((item) => {
            const Icon = item.icon;

            const cardContent = (
              <>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-300">{item.title}</p>
                {'value' in item ? <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.value}</p> : null}
                {'lines' in item ? (
                  <div className="space-y-1 font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : null}
                {'helper' in item && item.helper ? <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.helper}</p> : null}
              </>
            );

            if ('href' in item) {
              return (
                <a key={item.title} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined} className="premium-card flex h-full flex-col gap-3 p-5 no-underline">
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={item.title} className="premium-card flex h-full flex-col gap-3 p-5">
                {cardContent}
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-shell space-y-4">
        <h2 className="text-xl font-semibold">Работаем официально</h2>
        <div className="flex flex-wrap gap-2">
          {trustItems.map((item) => (
            <span key={item} className="rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800 dark:text-neutral-200">{item}</span>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Как мы работаем</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <div
              key={step.title}
              className="premium-card relative flex h-full flex-col p-6"
            >
              <span className="absolute right-5 top-5 text-xs font-semibold text-neutral-400">0{index + 1}</span>
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                <step.icon size={18} strokeWidth={1.9} aria-hidden="true" />
              </div>
              <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">{step.title}</p>
              <p className="t-body mt-2 dark:text-neutral-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="mb-2 t-h2">{messages.lead.title}</h2>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300">Оставьте контакты и короткое описание задачи.</p>
        <div id="contact-form"><ContactsLeadCapture t={messages} /></div>
      </section>

      <section className="grid items-start gap-6 md:grid-cols-2">
        <div>
          <h2 className="t-h2">Как нас найти</h2>
          <p className="mt-2 text-neutral-700 dark:text-neutral-300">Адрес: {BRAND.address}</p>
          <p className="text-neutral-700 dark:text-neutral-300">Тел: {BRAND.phone}</p>
          <p className="text-neutral-700 dark:text-neutral-300">E-mail: {BRAND.email}</p>
          <a className="btn-secondary mt-4 inline-block no-underline" href={BRAND.yandexRoute} target="_blank" rel="noreferrer">Маршрут в Яндекс.Картах</a>
        </div>
        <MapSection />
      </section>

      <section className="section-shell space-y-3 text-center">
        <h2 className="t-h2">Нужна консультация?</h2>
        <p className="text-neutral-700 dark:text-neutral-300">Ответим в течение 15 минут в рабочее время.</p>
        <Link href="/contacts#contact-form" className="btn-primary inline-flex no-underline">Перезвоните мне</Link>
      </section>
    </div>
  );
}

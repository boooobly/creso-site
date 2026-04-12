import Link from 'next/link';
import type { ComponentType } from 'react';
import { Calculator, Clock3, FileCheck2, Mail, MessageCircle, MessageSquare, Package, Phone, Send } from 'lucide-react';
import ContactsLeadCapture from '@/components/ContactsLeadCapture';
import MapSection from '@/components/MapSection';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { messages } from '@/lib/messages';
import { getPublicSiteSettings } from '@/lib/site-settings';
import { BRAND } from '@/lib/constants';

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

function toTelegramLink(value: string) {
  if (!value) return '#';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return value.startsWith('@') ? `https://t.me/${value.slice(1)}` : `https://t.me/${value}`;
}

function toWhatsAppLink(value: string) {
  if (!value) return '#';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const digits = value.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '#';
}

export default async function ContactsPage() {
  const [contentMap, settings] = await Promise.all([getPageContentMap('contacts'), getPublicSiteSettings()]);

  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Контакты');
  const ctaTitle = getPageContentValue(contentMap, 'cta', 'title', 'Нужна консультация?');
  const ctaDescription = getPageContentValue(contentMap, 'cta', 'description', 'Ответим в течение 15 минут в рабочее время.');
  const ctaButtonText = getPageContentValue(contentMap, 'cta', 'buttonText', 'Перезвоните мне');

  const quickContacts: Array<LinkedQuickContact | HoursQuickContact> = [
    { title: 'Позвонить', value: settings.phone, href: `tel:${settings.phoneHref}`, icon: Phone },
    { title: 'Telegram', value: settings.telegram, href: toTelegramLink(settings.telegram), icon: Send },
    { title: 'WhatsApp', value: settings.whatsapp, href: toWhatsAppLink(settings.whatsapp), icon: MessageCircle },
    { title: 'Email', value: settings.email, href: `mailto:${settings.email}`, icon: Mail },
    {
      title: 'График работы',
      lines: [settings.workingHours],
      helper: 'Отвечаем в рабочее время.',
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">{heroTitle}</h1>
        <p className="text-neutral-700 dark:text-neutral-300">Адрес: {settings.address}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickContacts.map((item) => {
            const Icon = item.icon;

            const cardContent = (
              <>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-300">{item.title}</p>
                {'value' in item ? <p className="break-words font-semibold text-neutral-900 dark:text-neutral-100">{item.value}</p> : null}
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
                <a key={item.title} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined} className="card flex h-full flex-col gap-3 rounded-xl p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={item.title} className="card flex h-full flex-col gap-3 rounded-xl p-5">
                {cardContent}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card space-y-4 rounded-xl p-6">
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
              className="relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white/90 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)] dark:border-neutral-800 dark:bg-neutral-900/85 dark:hover:border-neutral-700 dark:hover:shadow-none"
            >
              <span className="absolute right-5 top-5 text-xs font-semibold text-neutral-400">0{index + 1}</span>
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                <step.icon size={18} strokeWidth={1.9} aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-xl p-6">
        <h2 className="mb-2 text-2xl font-bold">{messages.lead.title}</h2>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300">Оставьте контакты и короткое описание задачи.</p>
        <div id="contact-form"><ContactsLeadCapture t={messages} /></div>
      </section>

      <section className="grid items-start gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Как нас найти</h2>
          <p className="mt-2 text-neutral-700 dark:text-neutral-300">Адрес: {settings.address}</p>
          <p className="text-neutral-700 dark:text-neutral-300">Тел: {settings.phone}</p>
          <p className="text-neutral-700 dark:text-neutral-300">E-mail: {settings.email}</p>
          <a className="btn-secondary mt-4 inline-block no-underline" href={BRAND.yandexRoute} target="_blank" rel="noreferrer">Маршрут в Яндекс.Картах</a>
        </div>
        <MapSection />
      </section>

      <section className="space-y-3 rounded-2xl bg-[var(--brand-red)]/10 p-6 text-center">
        <h2 className="text-2xl font-bold">{ctaTitle}</h2>
        <p className="text-neutral-700 dark:text-neutral-300">{ctaDescription}</p>
        <Link href="/contacts#contact-form" className="btn-primary inline-flex no-underline">{ctaButtonText}</Link>
      </section>
    </div>
  );
}

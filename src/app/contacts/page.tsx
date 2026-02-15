import Link from 'next/link';
import { MessageCircle, Mail, Phone, Send } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import MapSection from '@/components/MapSection';
import { BRAND } from '@/lib/constants';
import { messages } from '@/lib/messages';

const quickContacts = [
  { title: 'Позвонить', value: '+7 988 731 74 04', href: 'tel:+79887317404', icon: Phone },
  { title: 'Telegram', value: '@Credomir', href: 'https://t.me/Credomir', icon: Send },
  { title: 'Max Messenger', value: '+7 988 731 74 04', href: 'https://wa.me/79887317404', icon: MessageCircle },
  { title: 'Email', value: 'credomir26@mail.ru', href: 'mailto:credomir26@mail.ru', icon: Mail },
];

const trustItems = [
  'ИП Кошелева Валентина Валерьевна',
  'ИНН 263106597812',
  'ОГРНИП 322265100113550',
  'Работаем с физическими и юридическими лицами',
  'Безналичная оплата',
];

const processSteps = ['Оставляете заявку', 'Рассчитываем стоимость', 'Согласуем макет', 'Изготавливаем и передаем'];

export default function ContactsPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Контакты</h1>
        <p className="text-neutral-700 dark:text-neutral-300">Адрес: {BRAND.address}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickContacts.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.title} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined} className="card flex h-full flex-col gap-3 rounded-xl p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-300">{item.title}</p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.value}</p>
              </a>
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <div key={step} className="card rounded-xl p-4">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-red)]/10 font-semibold text-[var(--brand-red)]">{index + 1}</div>
              <p className="text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-xl p-6">
        <h2 className="mb-2 text-2xl font-bold">{messages.lead.title}</h2>
        <p className="mb-4 text-neutral-700 dark:text-neutral-300">Оставьте контакты и короткое описание задачи.</p>
        <div id="contact-form"><LeadForm t={messages} /></div>
      </section>

      <section className="grid items-start gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Как нас найти</h2>
          <p className="mt-2 text-neutral-700 dark:text-neutral-300">Адрес: {BRAND.address}</p>
          <p className="text-neutral-700 dark:text-neutral-300">Тел: {BRAND.phone}</p>
          <p className="text-neutral-700 dark:text-neutral-300">E-mail: {BRAND.email}</p>
          <a className="btn-secondary mt-4 inline-block no-underline" href={BRAND.yandexRoute} target="_blank" rel="noreferrer">Маршрут в Яндекс.Картах</a>
        </div>
        <MapSection />
      </section>

      <section className="space-y-3 rounded-2xl bg-[var(--brand-red)]/10 p-6 text-center">
        <h2 className="text-2xl font-bold">Нужна консультация?</h2>
        <p className="text-neutral-700 dark:text-neutral-300">Ответим в течение 15 минут в рабочее время.</p>
        <Link href="/contacts#contact-form" className="btn-primary inline-flex no-underline">Перезвоните мне</Link>
      </section>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Brush, CheckCheck, ChevronDown, Palette, Shirt, Sparkles, Timer, UploadCloud } from 'lucide-react';
import { CSSProperties, ReactNode, useState } from 'react';
import OrderTshirtsForm from '@/components/OrderTshirtsForm';
import { useRevealOnScroll } from '@/lib/hooks/useRevealOnScroll';

type FaqItem = { question: string; answer: string };

type SectionRenderState = {
  isVisible: boolean;
  prefersReducedMotion: boolean;
};

type SectionBlockProps = {
  title: string;
  subtitle?: string;
  children: (state: SectionRenderState) => ReactNode;
};

const kpiChips = ['A4 - 250 ₽/сторона', 'Футболки - от 500 ₽', 'Без минималки'];

const pricingCards = [
  {
    title: 'Полноцвет A4',
    price: '250 ₽/сторона',
    lines: ['Перед, спина или рукав', 'Проверка макета перед стартом'],
    featured: true,
  },
  { title: 'Футболки', price: 'от 500 ₽', lines: ['Размеры 32–60', 'Можно печатать на наших или ваших'], featured: false },
  {
    title: 'Термоплёнка',
    price: 'Расчёт менеджером',
    lines: ['Печать + резка + перенос', 'Цветная и флуор плёнка'],
    featured: false,
  },
] as const;

const galleryCards = [
  { title: 'Логотип на груди', tag: 'A4', align: 'left' },
  { title: 'Спина A4', tag: 'спина', align: 'center' },
  { title: 'Надпись термоплёнкой', tag: 'термоплёнка', align: 'right' },
  { title: 'Парные футболки', tag: 'пара', align: 'left' },
  { title: 'Мерч для команды', tag: 'мерч', align: 'center' },
  { title: 'Индивидуальный принт', tag: 'кастом', align: 'right' },
] as const;

const steps = ['Пришлите макет или опишите задачу', 'Мы уточним детали и подтвердим стоимость', 'Печать и выдача/доставка'];

const advantages = [
  { text: 'Работаем по вашим файлам', icon: UploadCloud },
  { text: 'Помогаем с подготовкой макета', icon: Brush },
  { text: 'Печать на ваших футболках', icon: Shirt },
  { text: 'Без минимального тиража', icon: Sparkles },
  { text: 'Подтверждаем макет до печати', icon: CheckCheck },
  { text: 'Цветная и флуор плёнка', icon: Palette },
] as const;

const faqItems: FaqItem[] = [
  { question: 'Можно на вашей футболке?', answer: 'Да. Печатаем как на наших, так и на футболках клиента.' },
  { question: 'Сколько стоит футболка?', answer: 'Футболки от 500 ₽, итог зависит от размера и наличия. Точную цену сообщит менеджер.' },
  { question: 'Можно без файла?', answer: 'Да. Отправьте заявку без файла и опишите задачу в комментарии.' },
  { question: 'Сроки?', answer: 'Обычно 3–5 рабочих дней, но при свободной загрузке можем сделать быстрее.' },
  { question: 'Какие форматы?', answer: 'Растровые: PNG, JPG, JPEG, WEBP. Векторные: PDF, CDR, AI, EPS, DXF, SVG.' },
  { question: 'Есть минималка?', answer: 'Нет, минимального тиража нет.' },
];

function revealClass(isVisible: boolean, reduceMotion: boolean): string {
  if (reduceMotion) return 'opacity-100 translate-y-0';
  return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';
}

function delayStyle(index: number, reduceMotion: boolean): CSSProperties {
  return reduceMotion ? {} : { transitionDelay: `${index * 70}ms` };
}

function SectionBlock({ title, subtitle, children }: SectionBlockProps) {
  const reveal = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div
          ref={reveal.ref}
          className={`transition-all duration-700 ease-out motion-reduce:transition-none ${revealClass(reveal.isVisible, reveal.prefersReducedMotion)}`}
        >
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
            {subtitle && <p className="mt-2 max-w-3xl text-sm text-neutral-600 dark:text-neutral-300 md:text-base">{subtitle}</p>}
          </div>
          {children({ isVisible: reveal.isVisible, prefersReducedMotion: reveal.prefersReducedMotion })}
        </div>
      </div>
    </section>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.question} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="pr-4 text-sm font-semibold md:text-base">{item.question}</span>
              <ChevronDown
                className={`size-5 shrink-0 text-red-600 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            <div className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm text-neutral-600 dark:text-neutral-300">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnimatedCard({ index, reveal, className, children }: { index: number; reveal: SectionRenderState; className: string; children: ReactNode }) {
  return (
    <article
      style={delayStyle(index, reveal.prefersReducedMotion)}
      className={`${className} transition-all duration-500 motion-reduce:transition-none ${revealClass(reveal.isVisible, reveal.prefersReducedMotion)}`}
    >
      {children}
    </article>
  );
}

function ExampleMockup({ tag, align }: { tag: string; align: 'left' | 'center' | 'right' }) {
  const alignmentClass = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl border-b border-black/5 bg-gradient-to-br from-neutral-100 via-white to-neutral-200 p-4 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-950">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(38,38,38,0.45)_1px,transparent_0)] [background-size:10px_10px] dark:opacity-30" />
      <div className={`relative flex h-full justify-center ${alignmentClass}`}>
        <div className="relative mt-4 h-[78%] w-[66%] rounded-[2rem] bg-neutral-900/90 shadow-inner shadow-black/30 dark:bg-neutral-950">
          <div className="absolute left-1/2 top-[-12%] h-[22%] w-[40%] -translate-x-1/2 rounded-b-3xl bg-neutral-900/90 dark:bg-neutral-950" />
          <div className="absolute inset-x-[18%] top-[30%] h-[32%] rounded-xl border border-white/20 bg-white/85 dark:border-white/10 dark:bg-white/10" />
        </div>
      </div>
      <span className="absolute left-4 top-4 rounded-full border border-red-300/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:border-red-900 dark:bg-neutral-900/90 dark:text-red-200">
        {tag}
      </span>
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 motion-reduce:transition-none" />
    </div>
  );
}

export default function TshirtsLanding() {
  const heroReveal = useRevealOnScroll<HTMLDivElement>({ threshold: 0.12 });

  return (
    <div className="bg-neutral-100 pb-10 dark:bg-neutral-950">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.14),transparent_55%)]" aria-hidden="true" />
        <div className="container relative">
          <div
            ref={heroReveal.ref}
            className={`rounded-3xl border border-neutral-200 bg-white/95 p-7 shadow-xl backdrop-blur transition-all duration-700 dark:border-neutral-800 dark:bg-neutral-900/90 md:p-10 ${revealClass(heroReveal.isVisible, heroReveal.prefersReducedMotion)}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Студийный уровень печати</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">Печать на футболках</h1>
            <p className="mt-4 max-w-3xl text-sm text-neutral-600 dark:text-neutral-300 md:text-lg">Полноцвет A4 — 250 ₽ за 1 сторону. Работаем на ваших или наших футболках.</p>
            <p className="mt-2 flex items-start gap-2 text-sm text-neutral-500 dark:text-neutral-300">
              <Timer className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
              Итоговую стоимость и сроки подтверждает менеджер после проверки макета.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {kpiChips.map((chip, index) => (
                <span
                  key={chip}
                  style={delayStyle(index, heroReveal.prefersReducedMotion)}
                  className={`rounded-2xl border border-red-200/90 bg-gradient-to-br from-red-50 to-white px-4 py-3 text-center text-sm font-bold text-red-700 shadow-sm transition-all duration-500 dark:border-red-900/50 dark:from-red-950/40 dark:to-neutral-900 dark:text-red-200 md:text-base ${revealClass(heroReveal.isVisible, heroReveal.prefersReducedMotion)}`}
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#tshirt-request" className="inline-flex items-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-red-700 motion-reduce:transition-none">
                Оставить заявку
              </Link>
              <Link href="#examples" className="text-sm font-semibold text-neutral-700 underline-offset-4 transition hover:text-red-600 hover:underline dark:text-neutral-200 dark:hover:text-red-300">
                Смотреть примеры
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionBlock title="Тарифы" subtitle="Прозрачные условия без скрытых доплат. Для нестандартных задач менеджер подтвердит расчёт перед печатью.">
        {(reveal) => (
          <div className="grid gap-4 md:grid-cols-3">
            {pricingCards.map((card, index) => (
              <AnimatedCard
                key={card.title}
                index={index}
                reveal={reveal}
                className={`rounded-2xl border bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg dark:bg-neutral-900 ${
                  card.featured
                    ? 'border-red-300 ring-1 ring-red-200/70 dark:border-red-900 dark:ring-red-900/40'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  {card.featured && <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white">Популярно</span>}
                </div>
                <p className="mt-4 text-right text-2xl font-bold text-neutral-900 dark:text-neutral-50">{card.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {card.lines.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock title="Примеры работ">
        {(reveal) => (
          <div id="examples" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryCards.map((card, index) => (
              <AnimatedCard
                key={card.title}
                index={index}
                reveal={reveal}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <ExampleMockup tag={card.tag} align={card.align} />
                <div className="p-4">
                  <p className="text-sm font-semibold transition-colors duration-300 group-hover:text-red-600 dark:group-hover:text-red-300">{card.title}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock title="Как это работает">
        {(reveal) => (
          <div className="relative grid gap-4 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-6 hidden h-px bg-gradient-to-r from-transparent via-red-300/80 to-transparent md:block dark:via-red-900/70" aria-hidden="true" />
            {steps.map((step, index) => (
              <AnimatedCard
                key={step}
                index={index}
                reveal={reveal}
                className="relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-sm font-bold text-red-600 dark:border-red-900 dark:bg-red-950/40">{index + 1}</span>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{step}</p>
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock title="Почему выбирают нас">
        {(reveal) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item, index) => {
              const Icon = item.icon;

              return (
              <AnimatedCard
                key={item.text}
                index={index}
                reveal={reveal}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item.text}</p>
                </div>
              </AnimatedCard>
              );
            })}
          </div>
        )}
      </SectionBlock>

      <SectionBlock title="FAQ" subtitle="Коротко ответили на частые вопросы о печати на футболках.">
        {() => <FaqAccordion />}
      </SectionBlock>

      <section id="tshirt-request" className="py-12 md:py-16">
        <div className="container">
          <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Менеджер уточнит детали и подтвердит стоимость перед печатью.</p>
          <OrderTshirtsForm />
        </div>
      </section>
    </div>
  );
}

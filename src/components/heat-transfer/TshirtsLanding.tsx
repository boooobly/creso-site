'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
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
  { title: 'Полноцвет A4', lines: ['250 ₽/шт за 1 сторону', 'Любая сторона: перед/спина/рукав'] },
  { title: 'Футболки', lines: ['от 500 ₽', 'Размеры 32–60 - уточните у менеджера'] },
  {
    title: 'Термоплёнка',
    lines: ['Расчёт менеджером', 'Печать + резка + перенос', 'Белая, чёрная, зелёная, красная, жёлтая, розовая (флуор)'],
  },
];

const galleryCards = ['Логотип на груди', 'Спина A4', 'Надпись термоплёнкой', 'Парные футболки', 'Мерч для команды', 'Индивидуальный принт'];

const steps = ['Пришлите макет или опишите задачу', 'Мы уточним детали и подтвердим стоимость', 'Печать и выдача/доставка'];

const advantages = [
  'Работаем по вашим файлам',
  'Можно без макета - поможем подготовить',
  'Печать на ваших футболках',
  'Без минимального тиража',
  'Подтверждаем макет перед печатью',
  'Цветная и флуор плёнка',
];

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
              <span className="text-sm font-semibold md:text-base">{item.question}</span>
              <ChevronDown
                className={`size-5 shrink-0 text-red-600 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            <div className={`grid transition-all duration-300 motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
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
            <p className="mt-4 max-w-3xl text-sm text-neutral-600 dark:text-neutral-300 md:text-lg">
              Полноцвет A4 - 250 ₽ за 1 сторону. Работаем на ваших или наших футболках. Итоговую стоимость и сроки подтверждает менеджер
              после проверки макета.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 md:gap-3">
              {kpiChips.map((chip, index) => (
                <span
                  key={chip}
                  style={delayStyle(index, heroReveal.prefersReducedMotion)}
                  className={`rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition-all duration-500 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200 ${revealClass(heroReveal.isVisible, heroReveal.prefersReducedMotion)}`}
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-7">
              <Link href="#tshirt-request" className="inline-flex items-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-red-700 motion-reduce:transition-none">
                Оставить заявку
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
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryCards.map((card, index) => (
              <AnimatedCard
                key={card}
                index={index}
                reveal={reveal}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex h-40 items-end bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-50 p-4 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950">
                  <span className="rounded-lg bg-black/60 px-2 py-1 text-xs text-white">Фото будет</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{card}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock title="Как это работает">
        {(reveal) => (
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <AnimatedCard
                key={step}
                index={index}
                reveal={reveal}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <p className="text-sm font-semibold text-red-600">Шаг {index + 1}</p>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{step}</p>
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock title="Почему выбирают нас">
        {(reveal) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item, index) => (
              <AnimatedCard
                key={item}
                index={index}
                reveal={reveal}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item}</p>
              </AnimatedCard>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock title="FAQ" subtitle="Коротко ответили на частые вопросы о печати на футболках.">
        {() => <FaqAccordion />}
      </SectionBlock>

      <section id="tshirt-request" className="py-12 md:py-16">
        <div className="container">
          <OrderTshirtsForm />
        </div>
      </section>
    </div>
  );
}

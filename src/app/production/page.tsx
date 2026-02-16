import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import Section from '@/components/Section';

const capabilities = [
  'ЧПУ 2×4 м',
  'Широкоформатная печать 3.2 м',
  'Сварка и покраска',
  'Монтажная бригада',
];

const processSteps = ['Замер', 'Проектирование', 'Производство', 'Монтаж'];

const guarantees = ['Работаем по договору', 'Фиксируем смету', 'Согласуем макет', 'Даём гарантию'];

export default function ProductionPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card space-y-5 p-6 md:p-8">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-4xl">Собственное производство рекламных конструкций</h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-700 md:text-lg">
            Более 15 лет изготавливаем и монтируем конструкции на своей базе.
          </p>
          <Link href="/contacts" className="btn-primary inline-flex no-underline">
            Обсудить проект
          </Link>
        </div>
      </Section>

      <Section className="py-8">
        <div className="space-y-5 rounded-2xl border border-red-100 bg-red-50/40 p-6 md:p-8">
          <h2 className="text-2xl font-semibold md:text-3xl">Наши производственные возможности</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((item) => (
              <RevealOnScroll key={item}>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-base font-medium text-neutral-800">{item}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold md:text-3xl">Фото производства</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-52 rounded-3xl bg-gradient-to-br from-neutral-200 to-neutral-300 shadow-inner ring-1 ring-neutral-200 md:h-64"
                aria-label={`Плейсхолдер фото производства ${item}`}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold md:text-3xl">Как проходит работа</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-base font-medium text-neutral-800">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
          <h2 className="text-2xl font-semibold md:text-3xl">Гарантии прозрачной работы</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {guarantees.map((item) => (
              <div key={item} className="rounded-xl bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 ring-1 ring-neutral-200/70">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold">Готовы обсудить задачу?</h2>
            <p className="text-neutral-700">Подготовим расчёт и предложим оптимальное решение под ваш проект.</p>
          </div>
          <Link href="/contacts" className="btn-primary inline-flex no-underline">
            Получить расчёт
          </Link>
        </div>
      </Section>
    </div>
  );
}

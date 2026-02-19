import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import ReviewsClient from '@/components/ReviewsClient';

type TrustItem = {
  icon: string;
  title: string;
  description: string;
};

const trustPoints: TrustItem[] = [
  {
    icon: '🏭',
    title: 'Собственное производство',
    description: 'Контролируем качество и соблюдаем сроки на каждом этапе.',
  },
  {
    icon: '📝',
    title: 'Работа по договору',
    description: 'Фиксируем условия, стоимость и сроки до старта проекта.',
  },
  {
    icon: '🛡️',
    title: 'Гарантия на конструкции',
    description: 'Даём гарантийные обязательства на выполненные работы.',
  },
  {
    icon: '🧰',
    title: 'Своя монтажная бригада',
    description: 'Монтаж выполняют штатные специалисты с профильным опытом.',
  },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-12 md:space-y-16">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Отзывы реальных клиентов</h1>
        <p className="mx-auto max-w-3xl text-base text-neutral-600 dark:text-neutral-300 md:text-lg">
          Публикуем только отзывы, прошедшие модерацию.
        </p>
      </section>

      <ReviewsClient />

      <section className="card rounded-2xl p-6 md:p-8">
        <RevealOnScroll>
          <h2 className="mb-4 text-xl font-semibold md:text-2xl">Почему нам доверяют</h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {trustPoints.map((point) => (
              <li key={point.title} className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/60">
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none" aria-hidden>
                    {point.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 md:text-base">{point.title}</p>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300 md:text-sm">{point.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </section>

      <section className="pb-2 text-center">
        <RevealOnScroll>
          <Link href="/contacts" className="btn-primary no-underline">
            Обсудить проект
          </Link>
        </RevealOnScroll>
      </section>
    </div>
  );
}

import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import ReviewsClient, { type PublicReviewItem } from '@/components/ReviewsClient';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

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

const yandexReviewsUrl = 'https://yandex.com/maps/org/credomir/162252059264/reviews/?ll=41.959534%2C44.623058&z=17';
const yandexEmbedUrl = 'https://yandex.com/map-widget/v1/?ll=41.959534%2C44.623058&mode=search&oid=162252059264&z=17';

async function loadApprovedReviews(): Promise<PublicReviewItem[]> {
  try {
    const items = await prisma.review.findMany({
      where: { status: 'approved' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        name: true,
        isAnonymous: true,
        rating: true,
        text: true,
        createdAt: true,
      },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      isAnonymous: item.isAnonymous,
      rating: item.rating,
      text: item.text,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('[env]')) {
      return [];
    }

    console.error('[reviews/page] failed to load approved reviews', error);
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await loadApprovedReviews();

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Отзывы реальных клиентов</h1>
      </section>

      <ReviewsClient reviews={reviews} />

      <section className="card rounded-2xl p-6 md:p-8">
        <RevealOnScroll>
          <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <h2 className="text-xl font-semibold md:text-2xl">Отзывы на Яндекс Картах</h2>
            <a
              href={yandexReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary inline-flex items-center no-underline"
            >
              Смотреть отзывы
            </a>
          </div>

          <div className="relative w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 pb-[56.25%] dark:border-neutral-700 dark:bg-neutral-900">
            <iframe
              src={yandexEmbedUrl}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              title="Credomir на Яндекс Картах"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </RevealOnScroll>
      </section>

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

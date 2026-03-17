'use client';

import { useMemo, useState } from 'react';
import RevealOnScroll from '@/components/RevealOnScroll';
import ReviewSubmitForm from '@/components/ReviewSubmitForm';

export type PublicReviewItem = {
  id: string;
  name: string | null;
  isAnonymous: boolean;
  rating: number;
  text: string;
  createdAt: string;
};

type ReviewsClientProps = {
  reviews: PublicReviewItem[];
};

function getPublicName(review: PublicReviewItem): string {
  if (review.isAnonymous) {
    return 'Анонимный клиент';
  }

  const normalized = review.name?.trim();
  return normalized ? normalized : 'Клиент без имени';
}

export default function ReviewsClient({ reviews }: ReviewsClientProps) {
  const [visibleCount, setVisibleCount] = useState(9);
  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return null;
    }

    const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  return (
    <div className="space-y-6">
      <section className="card rounded-2xl p-5 md:p-6">
        <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2 md:text-left">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Средняя оценка</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {averageRating ? averageRating.toFixed(1) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Всего отзывов</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{reviews.length}</p>
          </div>
        </div>
      </section>

      <section className="flex justify-center md:justify-start">
        <ReviewSubmitForm />
      </section>

      {reviews.length === 0 ? (
        <section className="card rounded-2xl p-6 text-center md:p-8">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Пока нет опубликованных отзывов. Будьте первым, кто поделится впечатлением.
          </p>
        </section>
      ) : (
        <section>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {visibleReviews.map((review) => (
              <RevealOnScroll key={review.id}>
                <article className="card h-full rounded-2xl p-5 shadow-md transition-shadow hover:shadow-lg md:p-6">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{getPublicName(review)}</p>
                    <p className="text-xs text-neutral-500">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>

                  <p className="mb-3 text-base tracking-wide text-amber-500" aria-label={`Оценка ${review.rating} из 5`}>
                    {'★'.repeat(review.rating)} <span className="text-sm text-neutral-500">({review.rating}.0)</span>
                  </p>

                  <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{review.text}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>

          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="rounded-xl border border-neutral-300 px-5 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                onClick={() => setVisibleCount((current) => current + 9)}
              >
                Показать ещё
              </button>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { MessageSquareQuote, Send, Star } from 'lucide-react';
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
    <div className="space-y-6 md:space-y-7">
      <section className="card rounded-2xl p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Средняя оценка</p>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{averageRating ? averageRating.toFixed(1) : '—'}</p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Опубликовано</p>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{reviews.length}</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/65 p-4 dark:border-red-500/30 dark:bg-red-500/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700 dark:text-red-300">Формат</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Реальные отзывы клиентов</p>
            </div>
          </div>

          <div className="flex justify-start lg:justify-end">
            <ReviewSubmitForm />
          </div>
        </div>
      </section>

      {reviews.length === 0 ? (
        <section className="card rounded-2xl p-6 text-center md:p-8">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-300">
              <MessageSquareQuote className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              Пока нет опубликованных отзывов. Будьте первым, кто поделится впечатлением.
            </p>
          </div>
        </section>
      ) : (
        <section className="space-y-5 md:space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-2xl">Отзывы клиентов</h2>
            <p className="hidden text-sm text-neutral-500 md:block">Сначала новые</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {visibleReviews.map((review) => (
              <RevealOnScroll key={review.id}>
                <article className="premium-card h-full rounded-2xl border-neutral-200/90 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 md:p-6">
                  <div className="mb-3 flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 dark:border-neutral-800">
                    <div>
                      <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{getPublicName(review)}</p>
                      <p className="mt-1 text-xs text-neutral-500">{new Date(review.createdAt).toLocaleDateString('ru-RU')}</p>
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
                      <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                      {review.rating}.0
                    </div>
                  </div>

                  <p className="mb-3 text-sm tracking-[0.08em] text-amber-500" aria-label={`Оценка ${review.rating} из 5`}>
                    {'★'.repeat(review.rating)}
                  </p>

                  <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{review.text}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>

          {hasMore ? (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                onClick={() => setVisibleCount((current) => current + 9)}
              >
                Показать ещё
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

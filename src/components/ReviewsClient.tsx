'use client';

import { useEffect, useState } from 'react';
import RevealOnScroll from '@/components/RevealOnScroll';
import ReviewCard from '@/components/ReviewCard';
import ReviewSubmitForm from '@/components/ReviewSubmitForm';

type ReviewItem = {
  id: string;
  name: string | null;
  isAnonymous: boolean;
  rating: number;
  text: string;
  createdAt: string;
};

type ReviewsResponse = {
  items: ReviewItem[];
  totalApproved: number;
  averageRating: number | null;
  nextCursor: string | null;
};

const PAGE_LIMIT = 9;

type LoadState = 'loading' | 'error' | 'success';

function SummarySkeleton() {
  return (
    <section className="card rounded-2xl p-5 md:p-6" aria-hidden>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-8 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6" aria-hidden>
      {Array.from({ length: 4 }).map((_, idx) => (
        <article key={idx} className="card rounded-2xl p-5 md:p-6">
          <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mb-3 h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ReviewsClient() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalApproved, setTotalApproved] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [state, setState] = useState<LoadState>('loading');

  async function fetchPage(cursor?: string) {
    if (cursor) {
      setIsLoadingMore(true);
    } else {
      setState('loading');
    }

    try {
      const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
      if (cursor) {
        params.set('cursor', cursor);
      }

      const response = await fetch(`/api/reviews?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить отзывы.');
      }

      const data = (await response.json()) as ReviewsResponse;

      setItems((prev) => (cursor ? [...prev, ...data.items] : data.items));
      setNextCursor(data.nextCursor);
      setTotalApproved(data.totalApproved);
      setAverageRating(data.averageRating);
      setState('success');
    } catch {
      if (!cursor) {
        setItems([]);
        setNextCursor(null);
        setTotalApproved(0);
        setAverageRating(null);
        setState('error');
      }
    } finally {
      if (cursor) {
        setIsLoadingMore(false);
      }
    }
  }

  useEffect(() => {
    void fetchPage();
  }, []);

  return (
    <div className="space-y-6">
      {state === 'loading' ? (
        <>
          <SummarySkeleton />
          <section className="flex justify-center md:justify-start">
            <ReviewSubmitForm />
          </section>
          <ReviewsSkeleton />
        </>
      ) : null}

      {state === 'error' ? (
        <section className="card rounded-2xl p-6 text-center md:p-8">
          <p className="text-base font-medium text-red-600">Не удалось загрузить отзывы.</p>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Проверьте соединение и попробуйте снова.</p>
          <button
            type="button"
            onClick={() => void fetchPage()}
            className="mt-4 rounded-xl border border-neutral-300 px-5 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Повторить
          </button>
        </section>
      ) : null}

      {state === 'success' ? (
        <>
          <section className="card rounded-2xl p-5 md:p-6">
            <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2 md:text-left">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">Средняя оценка</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {averageRating ? averageRating.toFixed(1) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">Подтверждённых отзывов</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalApproved}</p>
              </div>
            </div>
          </section>

          <section className="flex justify-center md:justify-start">
            <ReviewSubmitForm />
          </section>

          <section>
            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                  {items.map((review) => (
                    <RevealOnScroll key={review.id}>
                      <ReviewCard
                        name={review.isAnonymous ? 'Анонимный клиент' : review.name?.trim() || 'Клиент'}
                        rating={review.rating}
                        text={review.text}
                        createdAt={review.createdAt}
                      />
                    </RevealOnScroll>
                  ))}
                </div>

                {nextCursor ? (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      className="rounded-xl border border-neutral-300 px-5 py-2 text-sm font-medium transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      onClick={() => void fetchPage(nextCursor)}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? 'Загрузка...' : 'Показать ещё'}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <RevealOnScroll>
                <div className="card rounded-2xl p-6 text-center md:p-8">
                  <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">Пока нет отзывов</p>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                    Будьте первым — оставьте отзыв о нашей работе.
                  </p>
                </div>
              </RevealOnScroll>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

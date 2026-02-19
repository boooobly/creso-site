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

export default function ReviewsClient() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalApproved, setTotalApproved] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPage(cursor?: string) {
    setIsLoading(true);
    setError(null);

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
    } catch {
      setError('Не удалось загрузить отзывы. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchPage();
  }, []);

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
                  disabled={isLoading}
                >
                  {isLoading ? 'Загрузка...' : 'Load more'}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <RevealOnScroll>
            <div className="card rounded-2xl p-6 text-center md:p-8">
              <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">No reviews yet</p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Будьте первым — оставьте отзыв о нашей работе.
              </p>
            </div>
          </RevealOnScroll>
        )}

        {error ? <p className="mt-4 text-center text-sm text-red-600">{error}</p> : null}
      </section>
    </div>
  );
}

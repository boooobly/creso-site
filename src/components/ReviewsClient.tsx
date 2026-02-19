'use client';

import { useMemo, useState } from 'react';
import RevealOnScroll from '@/components/RevealOnScroll';
import ReviewSubmitForm from '@/components/ReviewSubmitForm';

type DemoReview = {
  id: string;
  name: string;
  levelText: string;
  date: string;
  text: string;
  rating: number;
  hasOrgReply: boolean;
  likes?: number;
  dislikes?: number;
};

const MONTH_INDEX: Record<string, number> = {
  января: 0,
  февраля: 1,
  марта: 2,
  апреля: 3,
  мая: 4,
  июня: 5,
  июля: 6,
  августа: 7,
  сентября: 8,
  октября: 9,
  ноября: 10,
  декабря: 11,
};

const DEMO_REVIEWS: DemoReview[] = [
  {
    id: '1',
    name: 'Ксюша',
    levelText: 'Знаток города 3 уровня',
    date: '21 февраля 2024',
    text: 'Все очень понравилось, сделали работу очень быстро , качественно и красиво, девушка очень добрая, помогла , с выбором, все рассказала😊',
    hasOrgReply: true,
    rating: 5,
  },
  {
    id: '2',
    name: 'Влад Кошелев',
    levelText: 'Знаток города 6 уровня',
    date: '10 октября 2023',
    text: 'Лучшее рекламное агентство, которое есть в городе. Выполнили работу точно в срок! Долго искал компанию, которая работает по принципу качественно и в срок, но нашел ту, которая работает по принципу: качество = время = цена!',
    hasOrgReply: true,
    rating: 5,
  },
  {
    id: '3',
    name: 'Екатерина Маджарова',
    levelText: 'Знаток города 5 уровня',
    date: '3 апреля 2024',
    text: 'Хорошее агентство. Обращалась к ним не однократно. Работу выполняют всегда качественно и быстро.',
    hasOrgReply: true,
    rating: 5,
  },
  {
    id: '4',
    name: 'All',
    levelText: 'Знаток города 5 уровня',
    date: '9 сентября 2022',
    text: 'Мне все понравилось. Ребята знают свою работу, делают быстро и КАЧЕСТВЕННО!!! за умеренные деньги!',
    hasOrgReply: true,
    rating: 5,
    likes: 4,
    dislikes: 1,
  },
  {
    id: '5',
    name: 'Владимир',
    levelText: 'Знаток города 6 уровня',
    date: '11 октября 2023',
    text: 'Отличная фирма, если хотите получить хорошее обслуживание и хорошую работу, то это именно то место',
    hasOrgReply: true,
    rating: 5,
  },
  {
    id: '6',
    name: 'Наталья Б.',
    levelText: 'Знаток города 5 уровня',
    date: '25 июля 2024',
    text: 'Качественное выполнение работы. Заказывали несколько картин одеть в рамки. Мастер с золотыми руками, вы приносите людям радость.',
    hasOrgReply: false,
    rating: 5,
  },
  {
    id: '7',
    name: 'Валентина К.',
    levelText: 'Знаток города 2 уровня',
    date: '7 октября 2019',
    text: 'Место, где Вам всегда рады! Большой выбор услуг: от наружной рекламы до багетной мастерской по изготовлению рамочек. Кстати рамки не только прямоугольной или квадратной формы, но и овал, круг или любой неправильной формы. Фрезерный станок ЧПУ с большим столом…',
    hasOrgReply: false,
    rating: 5,
  },
  {
    id: '8',
    name: 'Анна Овчинникова',
    levelText: 'Знаток города 8 уровня',
    date: '25 июля 2019',
    text: 'Большой выбор , приемлемые цены, привлекательная программа лояльности, вежливые сотрудники. Рекомендую!',
    hasOrgReply: true,
    rating: 5,
    likes: 2,
    dislikes: 2,
  },
  {
    id: '9',
    name: 'Юрий Дубков',
    levelText: 'Знаток города 12 уровня',
    date: '27 мая 2022',
    text: 'Заказывали таблички. Всё сделали быстро и качественно Доброжелательные сотрудники.',
    hasOrgReply: true,
    rating: 5,
    likes: 1,
    dislikes: 1,
  },
  {
    id: '10',
    name: 'Прохор Прохоров',
    levelText: 'Знаток города 12 уровня',
    date: '23 мая 2020',
    text: 'Из плюсов, большой выбор багетов. На этом всё. Работа выполненная в мастерской не понравилась. Цветовая гамма не соответствует. Качество материала оставляет желать лучшего…',
    hasOrgReply: true,
    rating: 2,
    likes: 3,
    dislikes: 3,
  },
  {
    id: '11',
    name: 'Слоненок',
    levelText: 'Знаток города 7 уровня',
    date: '28 января 2020',
    text: 'Супер отличная багетная мастерская. Приветливый персонал и доброе отношение.',
    hasOrgReply: false,
    rating: 5,
    likes: 1,
    dislikes: 1,
  },
  {
    id: '12',
    name: 'Дмитрий Щ.',
    levelText: 'Знаток города 3 уровня',
    date: '24 декабря 2019',
    text: 'Быстро ,чётко!!!',
    hasOrgReply: false,
    rating: 5,
  },
];

function parseRuDate(value: string): number {
  const parts = value.trim().split(' ');
  if (parts.length !== 3) {
    return 0;
  }

  const day = Number(parts[0]);
  const month = MONTH_INDEX[parts[1]];
  const year = Number(parts[2]);

  if (Number.isNaN(day) || Number.isNaN(year) || month === undefined) {
    return 0;
  }

  return new Date(year, month, day).getTime();
}

export default function ReviewsClient() {
  const sortedReviews = useMemo(
    () => [...DEMO_REVIEWS].sort((a, b) => (b.rating - a.rating) || (parseRuDate(b.date) - parseRuDate(a.date))),
    [],
  );

  const [visibleCount, setVisibleCount] = useState(9);
  const visibleReviews = sortedReviews.slice(0, visibleCount);
  const hasMore = visibleCount < sortedReviews.length;

  const averageRating = useMemo(() => {
    if (!sortedReviews.length) {
      return null;
    }

    const sum = sortedReviews.reduce((acc, item) => acc + item.rating, 0);
    return sum / sortedReviews.length;
  }, [sortedReviews]);

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
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{sortedReviews.length}</p>
          </div>
        </div>
      </section>

      <section className="flex justify-center md:justify-start">
        <ReviewSubmitForm />
      </section>

      <section>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {visibleReviews.map((review) => (
            <RevealOnScroll key={review.id}>
              <article className="card h-full rounded-2xl p-5 shadow-md transition-shadow hover:shadow-lg md:p-6">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{review.name}</p>
                    <p className="text-xs text-neutral-500">{review.levelText}</p>
                  </div>
                  <p className="text-xs text-neutral-500">{review.date}</p>
                </div>

                <p className="mb-3 text-base tracking-wide text-amber-500" aria-label={`Оценка ${review.rating} из 5`}>
                  {'★'.repeat(review.rating)} <span className="text-sm text-neutral-500">({review.rating}.0)</span>
                </p>

                <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{review.text}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {review.hasOrgReply ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Есть ответ организации
                    </span>
                  ) : null}

                  {typeof review.likes === 'number' && typeof review.dislikes === 'number' ? (
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      👍 {review.likes} / 👎 {review.dislikes}
                    </span>
                  ) : null}
                </div>
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
    </div>
  );
}

import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import ReviewCard from '@/components/ReviewCard';
import ReviewSubmitForm from '@/components/ReviewSubmitForm';

type ReviewListItem = {
  id: string;
  name: string;
  isAnonymous: boolean;
  rating: number;
  text: string;
  createdAt: string;
};

const reviewsStub: ReviewListItem[] = [];

const trustPoints = [
  'Собственное производство, 15+ лет опыта',
  'Работаем по договору',
  'Гарантия на конструкции',
  'Собственная монтажная бригада',
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

      <section>
        {reviewsStub.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {reviewsStub.map((review) => (
              <RevealOnScroll key={review.id}>
                <ReviewCard
                  name={review.isAnonymous ? 'Анонимный клиент' : review.name.trim() || 'Клиент'}
                  rating={review.rating}
                  text={review.text}
                  createdAt={review.createdAt}
                />
              </RevealOnScroll>
            ))}
          </div>
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
      </section>

      <section>
        <RevealOnScroll>
          <ReviewSubmitForm />
        </RevealOnScroll>
      </section>

      <section className="card rounded-2xl p-6 md:p-8">
        <RevealOnScroll>
          <h2 className="mb-4 text-xl font-semibold md:text-2xl">Почему нам доверяют</h2>
          <ul className="grid grid-cols-1 gap-3 text-sm text-neutral-700 dark:text-neutral-300 md:grid-cols-2 md:text-base">
            {trustPoints.map((point) => (
              <li key={point} className="rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/60">
                {point}
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

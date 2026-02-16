import Link from 'next/link';
import RevealOnScroll from '@/components/RevealOnScroll';
import ReviewCard from '@/components/ReviewCard';

type ReviewItem = {
  id: number;
  businessType: string;
  clientName: string;
  rating: number;
  reviewText: string;
  reviewDate?: string;
  photoSrc: string;
};

const reviews: ReviewItem[] = [
  {
    id: 1,
    businessType: 'Клиент',
    clientName: 'Наталья Ш.',
    rating: 5,
    reviewText:
      'Очень довольна работой компании: помогли с макетом, быстро согласовали размеры и изготовили вывеску точно в срок. Монтаж выполнили аккуратно, смотрится дорого и аккуратно.',
    reviewDate: 'Яндекс Карты • июль 2024',
    photoSrc: '/images/reviews/client-1.svg',
  },
  {
    id: 2,
    businessType: 'Магазин',
    clientName: 'Игорь М.',
    rating: 5,
    reviewText:
      'Заказывали наружную рекламу для магазина. Подсказали оптимальный вариант по бюджету, все прописали в договоре и сделали без задержек. По качеству материалов вопросов нет.',
    reviewDate: 'Яндекс Карты • май 2024',
    photoSrc: '/images/reviews/client-2.svg',
  },
  {
    id: 3,
    businessType: 'Кафе',
    clientName: 'Екатерина П.',
    rating: 5,
    reviewText:
      'Обращались за оформлением фасада и меню-бордов. Приятно, что команда предлагает решения, а не просто печатает по ТЗ. В итоге получили очень аккуратный и заметный результат.',
    reviewDate: 'Яндекс Карты • март 2024',
    photoSrc: '/images/reviews/client-3.svg',
  },
  {
    id: 4,
    businessType: 'Салон красоты',
    clientName: 'Алина К.',
    rating: 5,
    reviewText:
      'Сделали брендирование входной группы и таблички внутри салона. Все размеры соблюдены, цвета переданы точно, монтажная бригада приехала вовремя. Спасибо за профессиональный подход.',
    reviewDate: 'Яндекс Карты • январь 2024',
    photoSrc: '/images/reviews/client-4.svg',
  },
  {
    id: 5,
    businessType: 'Клиент',
    clientName: 'Сергей В.',
    rating: 5,
    reviewText:
      'Не первый раз заказываю здесь печать и конструкции. Всегда на связи, сроки реальные, качество стабильное. Рекомендую тем, кому нужно без лишней суеты и с гарантией.',
    reviewDate: 'Яндекс Карты • декабрь 2023',
    photoSrc: '/images/reviews/client-5.svg',
  },
];

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
          Отзывы о нашей работе в Невинномысске и Ставропольском крае
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {reviews.map((review) => (
            <RevealOnScroll key={review.id}>
              <ReviewCard {...review} />
            </RevealOnScroll>
          ))}
        </div>
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

type ReviewCardProps = {
  name: string;
  rating: number;
  text: string;
  createdAt: string;
};

export default function ReviewCard({ name, rating, text, createdAt }: ReviewCardProps) {
  const stars = '★'.repeat(rating);

  return (
    <article className="card h-full rounded-2xl p-5 shadow-md transition-shadow hover:shadow-lg md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{name}</p>
        <p className="text-xs text-neutral-500">{new Date(createdAt).toLocaleDateString('ru-RU')}</p>
      </div>

      <p className="mb-3 text-base tracking-wide text-amber-500" aria-label={`Оценка ${rating} из 5`}>
        {stars} <span className="text-sm text-neutral-500">({rating}.0)</span>
      </p>

      <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{text}</p>
    </article>
  );
}

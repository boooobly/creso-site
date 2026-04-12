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
        <p className="t-h4">{name}</p>
        <p className="t-small text-neutral-500 dark:text-neutral-400">{new Date(createdAt).toLocaleDateString('ru-RU')}</p>
      </div>

      <p className="mb-3 text-base tracking-wide text-amber-500 dark:text-amber-300" aria-label={`Оценка ${rating} из 5`}>
        {stars} <span className="t-small text-neutral-500 dark:text-neutral-400">({rating}.0)</span>
      </p>

      <p className="t-body">{text}</p>
    </article>
  );
}

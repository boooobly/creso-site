import Image from 'next/image';

type ReviewCardProps = {
  businessType: string;
  clientName: string;
  rating: number;
  reviewText: string;
  reviewDate?: string;
  photoSrc: string;
};

export default function ReviewCard({ businessType, clientName, rating, reviewText, reviewDate, photoSrc }: ReviewCardProps) {
  const stars = '★'.repeat(rating);

  return (
    <article className="card h-full rounded-2xl p-5 shadow-md transition-shadow hover:shadow-lg md:p-6">
      <div className="mb-4 flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
          <Image src={photoSrc} alt={`Фото клиента ${clientName}`} fill sizes="56px" className="object-cover" />
        </div>
        <div>
          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{clientName}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{businessType}</p>
        </div>
      </div>

      <p className="mb-3 text-base tracking-wide text-amber-500" aria-label={`Оценка ${rating} из 5`}>
        {stars} <span className="text-sm text-neutral-500">({rating}.0)</span>
      </p>

      <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{reviewText}</p>

      {reviewDate ? <p className="mt-4 text-xs text-neutral-500">{reviewDate}</p> : null}
    </article>
  );
}

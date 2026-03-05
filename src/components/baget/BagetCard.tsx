'use client';

import Image from 'next/image';
import { memo, useEffect, useMemo, useState } from 'react';

export type BagetItem = {
  id: string;
  article: string;
  name: string;
  color: string;
  style: string;
  width_mm: number;
  price_per_meter: number;
  cardImage?: string;
  frameTextureImage?: string;
  fallbackImage?: string;
};

type BagetCardProps = {
  item: BagetItem;
  selected: boolean;
  onSelect: (item: BagetItem) => void;
};

const BAGET_PLACEHOLDER_IMAGE = '/images/outdoor-portfolio/placeholder-1.svg';

function BagetCardBase({ item, selected, onSelect }: BagetCardProps) {
  const imageCandidates = useMemo(
    () => [item.cardImage, item.fallbackImage, BAGET_PLACEHOLDER_IMAGE].filter(Boolean) as string[],
    [item.cardImage, item.fallbackImage],
  );
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [item.id, imageCandidates]);

  const currentImage = imageCandidates[Math.min(imageIndex, imageCandidates.length - 1)] ?? BAGET_PLACEHOLDER_IMAGE;

  return (
    <article
      className={`card flex h-full flex-col rounded-2xl p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        selected
          ? 'border-[var(--brand-red)] ring-1 ring-[var(--brand-red)]/30 shadow-[0_8px_22px_rgba(220,38,38,0.2)]'
          : ''
      }`}
    >
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={currentImage}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover"
          loading="lazy"
          onError={() => setImageIndex((prev) => Math.min(prev + 1, imageCandidates.length - 1))}
        />
      </div>
      <h3 className="min-h-[2.25rem] text-xs font-semibold leading-tight sm:text-sm">{item.name}</h3>
      <p className="mt-1 text-[11px] text-neutral-600 sm:text-xs">{item.width_mm} мм</p>
      <p className="text-[11px] text-neutral-700 sm:text-xs">{item.price_per_meter.toLocaleString('ru-RU')} ₽ / м</p>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={[
          'mt-auto w-full rounded-xl border px-2.5 py-1.5 text-xs transition-all duration-200 active:scale-[0.98] sm:text-sm',
          selected
            ? 'border-red-600 bg-red-600 text-white shadow-md'
            : 'border-neutral-300 bg-white text-neutral-900 hover:scale-[1.02] hover:border-red-500 hover:bg-red-50',
        ].join(' ')}
      >
        {selected ? 'Выбран' : 'Выбрать багет'}
      </button>
    </article>
  );
}

const BagetCard = memo(BagetCardBase);
export default BagetCard;

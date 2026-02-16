'use client';

import Image from 'next/image';
import { memo } from 'react';

export type BagetItem = {
  id: string;
  article: string;
  name: string;
  color: string;
  style: string;
  width_mm: number;
  price_per_meter: number;
  image: string;
};

type BagetCardProps = {
  item: BagetItem;
  selected: boolean;
  onSelect: (item: BagetItem) => void;
};

function BagetCardBase({ item, selected, onSelect }: BagetCardProps) {
  return (
    <article
      className={`card rounded-2xl p-3 shadow-sm transition ${
        selected ? 'border-[var(--brand-red)] ring-1 ring-[var(--brand-red)]/30' : ''
      }`}
    >
      <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover"
          loading="lazy"
        />
      </div>
      <h3 className="text-sm font-semibold leading-tight">{item.name}</h3>
      <p className="mt-1 text-xs text-neutral-600">{item.width_mm} мм</p>
      <p className="text-xs text-neutral-700">{item.price_per_meter.toLocaleString('ru-RU')} ₽ / м</p>
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={[
          'mt-2 w-full rounded-xl border px-3 py-2 text-sm transition-all duration-200 active:scale-[0.98]',
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

'use client';

import Image from 'next/image';
import type { BagetItem } from './BagetCard';

const BAGET_PLACEHOLDER_IMAGE = '/images/outdoor-portfolio/placeholder-1.svg';

type BagetMobileSelectorCardProps = {
  item: BagetItem;
  selected: boolean;
  onSelect: (item: BagetItem) => void;
};

export default function BagetMobileSelectorCard({ item, selected, onSelect }: BagetMobileSelectorCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-pressed={selected}
      className={[
        'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white p-2 text-left transition-all duration-150',
        'dark:bg-neutral-900',
        selected
          ? 'border-red-600 ring-2 ring-red-500/35 shadow-[0_8px_24px_-16px_rgba(220,38,38,0.9)]'
          : 'border-neutral-200 shadow-sm hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-500',
      ].join(' ')}
    >
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={item.cardImage || item.fallbackImage || BAGET_PLACEHOLDER_IMAGE}
          alt={`Угол багета ${item.name}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
        <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {item.article}
        </span>
        {selected ? (
          <span className="absolute right-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Выбран
          </span>
        ) : null}
      </div>

      <p className="line-clamp-2 min-h-8 text-xs font-medium leading-snug text-neutral-900 dark:text-neutral-100">{item.name}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.price_per_meter.toLocaleString('ru-RU')} ₽ / м</p>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-300">Ширина: {item.width_mm} мм</p>
    </button>
  );
}

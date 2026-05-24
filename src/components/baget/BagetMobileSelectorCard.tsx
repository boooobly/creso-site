'use client';

import { useEffect, useMemo, useState } from 'react';
import { BAGET_CARD_IMAGE_WIDTH, getBagetProxyImageSrc, type BagetItem } from './BagetCard';

const BAGET_PLACEHOLDER_IMAGE = '/images/outdoor-portfolio/placeholder-1.svg';

type BagetMobileSelectorCardProps = {
  item: BagetItem;
  selected: boolean;
  onSelect: (item: BagetItem) => void;
};

export function getMobileBagetImageCandidates(item: Pick<BagetItem, 'cardImage' | 'fallbackImage'>): string[] {
  return [item.cardImage, item.fallbackImage, BAGET_PLACEHOLDER_IMAGE].filter(Boolean) as string[];
}

export function getNextMobileBagetImageIndex(currentIndex: number, candidatesLength: number): number {
  const lastIndex = Math.max(0, candidatesLength - 1);
  const nextIndex = Math.min(currentIndex + 1, lastIndex);
  return nextIndex === currentIndex ? currentIndex : nextIndex;
}

export default function BagetMobileSelectorCard({ item, selected, onSelect }: BagetMobileSelectorCardProps) {
  const imageCandidates = useMemo(() => getMobileBagetImageCandidates(item), [item.cardImage, item.fallbackImage]);
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setImageIndex(0);
  }, [item.id, imageCandidates]);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [item.id, imageIndex]);

  const currentImage = imageCandidates[Math.min(imageIndex, imageCandidates.length - 1)] ?? BAGET_PLACEHOLDER_IMAGE;

  const handleImageError = () => {
    setImageIndex((prev) => getNextMobileBagetImageIndex(prev, imageCandidates.length));
  };

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
        {!isImageLoaded ? (
          <span
            className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-100 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800"
            aria-hidden="true"
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- Mobile baguette selector images should bypass Next optimization. */}
        <img
          src={getBagetProxyImageSrc(currentImage, BAGET_CARD_IMAGE_WIDTH)}
          alt={`Угол багета ${item.name}`}
          className={`h-full w-full object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsImageLoaded(true)}
          onError={handleImageError}
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
      <p className="text-[11px] text-neutral-500 dark:text-neutral-300">Ширина: {item.width_with_quarter_mm} мм</p>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-300">Без четверти: {item.width_mm} мм</p>
    </button>
  );
}

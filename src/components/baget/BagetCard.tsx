'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

export type BagetItem = {
  id: string;
  article: string;
  name: string;
  color: string;
  style: string;
  width_mm: number;
  width_with_quarter_mm: number;
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

export function getBagetProxyImageSrc(src: string, width: number): string {
  if (!src) return BAGET_PLACEHOLDER_IMAGE;
  if (src.startsWith('/')) return src;
  return `/api/baget/image-proxy?url=${encodeURIComponent(src)}&width=${width}`;
}

function BagetCardBase({ item, selected, onSelect }: BagetCardProps) {
  const thumbnailImgRef = useRef<HTMLImageElement | null>(null);
  const imageCandidates = useMemo(
    () => [item.cardImage, item.fallbackImage, BAGET_PLACEHOLDER_IMAGE].filter(Boolean) as string[],
    [item.cardImage, item.fallbackImage],
  );
  const [thumbnailImageIndex, setThumbnailImageIndex] = useState(0);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  useEffect(() => {
    setThumbnailImageIndex(0);
    setPreviewImageIndex(0);
  }, [item.id, imageCandidates]);

  useEffect(() => {
    if (!isImagePreviewOpen) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsImagePreviewOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isImagePreviewOpen]);

  const thumbnailImage = imageCandidates[Math.min(thumbnailImageIndex, imageCandidates.length - 1)] ?? BAGET_PLACEHOLDER_IMAGE;
  const previewImage = imageCandidates[Math.min(previewImageIndex, imageCandidates.length - 1)] ?? BAGET_PLACEHOLDER_IMAGE;

  const handleThumbnailImageError = () => {
    setThumbnailImageIndex((prev) => {
      const next = Math.min(prev + 1, imageCandidates.length - 1);
      return next === prev ? prev : next;
    });
  };

  const handlePreviewImageError = () => {
    setPreviewImageIndex((prev) => {
      const next = Math.min(prev + 1, imageCandidates.length - 1);
      return next === prev ? prev : next;
    });
  };

  const openImagePreview = () => {
    setPreviewImageIndex(Math.min(thumbnailImageIndex, imageCandidates.length - 1));
    setIsImagePreviewOpen(true);
  };

  return (
    <>
      <article
        className={`card flex h-full flex-col rounded-2xl border border-neutral-200/90 bg-white/95 p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-neutral-700/80 dark:bg-gradient-to-b dark:from-neutral-900 dark:to-[#1a1b20] dark:shadow-[0_18px_35px_-25px_rgba(0,0,0,0.7)] ${
          selected
            ? 'border-[var(--brand-red)] ring-1 ring-[var(--brand-red)]/30 shadow-[0_8px_22px_rgba(220,38,38,0.2)]'
            : ''
        }`}
      >
        <button
          type="button"
          onClick={openImagePreview}
          className="group relative mb-2 block aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-neutral-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2"
          aria-label={`Увеличить изображение багета ${item.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Baguette catalog images must bypass Next Image Optimization. */}
          <img
            src={getBagetProxyImageSrc(thumbnailImage, 700)}
            alt={`Угол багета ${item.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            ref={thumbnailImgRef}
            onError={handleThumbnailImageError}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all duration-200 group-hover:bg-black/25 group-hover:opacity-100 group-focus-visible:bg-black/25 group-focus-visible:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <ZoomIn size={14} aria-hidden="true" />
              Увеличить
            </span>
          </span>
        </button>
        <h3 className="min-h-[2.25rem] text-xs font-semibold leading-tight sm:text-sm">{item.name}</h3>
        <p className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-300 sm:text-xs">{item.width_with_quarter_mm} мм</p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 sm:text-xs">без четверти {item.width_mm} мм</p>
        <p className="text-[11px] text-neutral-700 dark:text-neutral-200 sm:text-xs">{item.price_per_meter.toLocaleString('ru-RU')} ₽ / м</p>
        <button
          type="button"
          onClick={() => onSelect(item)}
          className={[
            'mt-auto w-full rounded-xl border px-2.5 py-1.5 text-xs transition-all duration-200 active:scale-[0.98] sm:text-sm',
            selected
              ? 'border-red-600 bg-red-600 text-white shadow-md'
              : 'border-neutral-300 bg-white text-neutral-900 hover:scale-[1.02] hover:border-red-500 hover:bg-red-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-red-500 dark:hover:bg-red-500/20',
          ].join(' ')}
        >
          {selected ? 'Выбран' : 'Выбрать багет'}
        </button>
      </article>

      {isImagePreviewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsImagePreviewOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Увеличенное изображение багета ${item.name}`}
        >
          <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:p-4">
            <button
              type="button"
              onClick={() => setIsImagePreviewOpen(false)}
              aria-label="Закрыть увеличенное изображение"
              className="absolute right-2 top-2 z-10 rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <div className="relative mx-auto aspect-square w-full max-h-[80vh] overflow-hidden rounded-xl bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- Avoid Next image optimization for enlarged remote previews. */}
              <img
                src={getBagetProxyImageSrc(previewImage, 1600)}
                alt={`Увеличенный угол багета ${item.name}`}
                className="h-full w-full object-contain"
                loading="eager"
                decoding="async"
                onError={handlePreviewImageError}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const BagetCard = memo(BagetCardBase);
export default BagetCard;

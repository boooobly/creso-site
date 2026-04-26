'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PortfolioItem } from '@/types';
import ProtectedImage from '@/components/ui/ProtectedImage';

const ALL_FILTER = 'Все';
const UNCATEGORIZED_LABEL = 'Без категории';

const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

function getItemCategory(item: PortfolioItem) {
  const category = String(item.category ?? '').trim();
  return category || UNCATEGORIZED_LABEL;
}

function getItemDescription(item: PortfolioItem) {
  return String(item.shortDescription ?? '').trim();
}

function buildGallery(item: PortfolioItem) {
  const rawGallery = Array.isArray(item.galleryImages) ? item.galleryImages : [];
  const all = [item.image, ...rawGallery].map((entry) => String(entry ?? '').trim()).filter(Boolean);

  return Array.from(new Set(all));
}

export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const categories = useMemo(() => {
    const values = Array.from(new Set(items.map(getItemCategory))).sort((a, b) => a.localeCompare(b, 'ru'));
    return [ALL_FILTER, ...values];
  }, [items]);

  const [activeCategory, setActiveCategory] = useState(ALL_FILTER);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const filteredItems = useMemo(
    () => items.filter((item) => activeCategory === ALL_FILTER || getItemCategory(item) === activeCategory),
    [activeCategory, items]
  );

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeProjectId) ?? null,
    [activeProjectId, items]
  );

  const activeGallery = useMemo(() => (activeItem ? buildGallery(activeItem) : []), [activeItem]);

  useEffect(() => {
    setActiveCategory((prev) => (categories.includes(prev) ? prev : ALL_FILTER));
  }, [categories]);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveProjectId(null);
      }

      if (!activeGallery.length) {
        return;
      }

      if (event.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % activeGallery.length);
      }

      if (event.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + activeGallery.length) % activeGallery.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeGallery.length, activeItem]);

  return (
    <div className="space-y-5 md:space-y-7">
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-neutral-200/80 bg-gradient-to-r from-white/95 via-neutral-50/90 to-white/95 p-2 shadow-[0_10px_26px_-28px_rgba(15,23,42,0.45)] dark:border-neutral-800/90 dark:from-neutral-900/95 dark:via-neutral-900/88 dark:to-neutral-900/95 dark:shadow-[0_14px_28px_-28px_rgba(0,0,0,0.55)] sm:gap-2 sm:p-2.5">
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                'inline-flex min-h-10 items-center rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 sm:px-3.5 md:text-sm',
                isActive
                  ? 'border-red-200/80 bg-red-50 text-red-700 shadow-[0_10px_20px_-16px_rgba(220,38,38,0.6)] dark:border-red-500/45 dark:bg-red-500/15 dark:text-red-200'
                  : 'border-transparent bg-transparent text-neutral-600 hover:border-neutral-200/85 hover:bg-white/90 hover:text-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700/80 dark:hover:bg-neutral-800/85 dark:hover:text-neutral-100'
              )}
              aria-pressed={isActive}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const description = getItemDescription(item);

            return (
              <article key={item.id} className="card-visual card-interactive group overflow-hidden border-neutral-200/85 bg-white/90 shadow-[0_20px_40px_-34px_rgba(15,23,42,0.4)] dark:border-neutral-800/90 dark:bg-neutral-900/90">
                <button
                  type="button"
                  onClick={() => {
                    setActiveProjectId(item.id);
                    setActiveImageIndex(0);
                  }}
                  className="block w-full text-left"
                  aria-label={`Открыть проект ${item.title}`}
                >
                  <div className="relative h-52 overflow-hidden md:h-56">
                    <ProtectedImage
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/40 bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                      {getItemCategory(item)}
                    </span>
                  </div>

                  <div className="space-y-2.5 p-4 md:space-y-3 md:p-5">
                    <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-[1.2rem]">{item.title}</h3>
                    <p className="line-clamp-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-[0.95rem]">
                      {description || 'Описание проекта добавляется. Откройте карточку, чтобы посмотреть детали и изображения.'}
                    </p>
                    <div className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-red)]">
                      Смотреть проект
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card flex min-h-[180px] items-center justify-center border border-dashed border-neutral-300/80 bg-neutral-50/65 px-6 py-10 text-center text-sm leading-6 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-300">
          В этой категории пока нет опубликованных проектов.
        </div>
      )}

      {activeItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={`Просмотр проекта ${activeItem.title}`}
          onClick={() => setActiveProjectId(null)}
        >
          <div className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-200/30 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-950" onClick={(event) => event.stopPropagation()}>
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="relative bg-neutral-950">
                <ProtectedImage
                  src={activeGallery[activeImageIndex] ?? activeItem.image}
                  alt={activeItem.title}
                  width={1600}
                  height={1100}
                  className="h-full max-h-[72vh] w-full object-contain"
                  priority
                />
              </div>

              <aside className="flex max-h-[72vh] flex-col gap-4 overflow-y-auto p-5 md:p-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center rounded-full border border-red-200/80 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:border-red-500/45 dark:bg-red-500/15 dark:text-red-200">
                    {getItemCategory(activeItem)}
                  </span>
                  <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{activeItem.title}</h3>
                  <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    {getItemDescription(activeItem) || 'Подробное описание проекта пока не добавлено.'}
                  </p>
                </div>

                {activeGallery.length > 1 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">Галерея проекта</p>
                    <div className="grid grid-cols-4 gap-2">
                      {activeGallery.map((image, index) => {
                        const isCurrent = index === activeImageIndex;

                        return (
                          <button
                            key={`${activeItem.id}-${image}`}
                            type="button"
                            onClick={() => setActiveImageIndex(index)}
                            className={cn(
                              'relative overflow-hidden rounded-lg border transition-colors',
                              isCurrent
                                ? 'border-red-300 ring-1 ring-red-300/80 dark:border-red-500 dark:ring-red-500/70'
                                : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500'
                            )}
                            aria-label={`Показать изображение ${index + 1}`}
                            aria-pressed={isCurrent}
                          >
                            <ProtectedImage
                              src={image}
                              alt={`${activeItem.title} ${index + 1}`}
                              width={240}
                              height={160}
                              className="h-16 w-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setActiveProjectId(null)}
                  className="btn-secondary mt-auto w-full justify-center no-underline"
                >
                  Закрыть просмотр
                </button>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

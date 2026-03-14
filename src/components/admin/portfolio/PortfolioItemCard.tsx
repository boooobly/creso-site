'use client';

import Link from 'next/link';
import { useTransition } from 'react';

type PortfolioItemCardProps = {
  item: {
    id: string;
    title: string;
    category: string;
    shortDescription: string | null;
    coverImage: string | null;
    featured: boolean;
    published: boolean;
    sortOrder: number;
  };
  onTogglePublish: (id: string, nextPublished: boolean) => Promise<void>;
  onToggleFeatured: (id: string, nextFeatured: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function PortfolioItemCard({
  item,
  onTogglePublish,
  onToggleFeatured,
  onDelete
}: PortfolioItemCardProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[4/3] w-full bg-slate-100">
        {item.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Нет обложки</div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{item.category}</span>
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              item.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {item.published ? 'Опубликовано' : 'Скрыто'}
          </span>
          {item.featured ? <span className="rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-700">Избранное</span> : null}
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.shortDescription || 'Описание пока не добавлено.'}</p>
          <p className="mt-2 text-xs text-slate-500">Порядок показа: {item.sortOrder}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/admin/portfolio/${item.id}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Редактировать
          </Link>
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await onTogglePublish(item.id, !item.published);
              })
            }
            disabled={isPending}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {item.published ? 'Скрыть' : 'Опубликовать'}
          </button>

          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await onToggleFeatured(item.id, !item.featured);
              })
            }
            disabled={isPending}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {item.featured ? 'Убрать из избранного' : 'Сделать избранным'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!window.confirm('Удалить эту работу? Действие нельзя отменить.')) return;
              startTransition(async () => {
                await onDelete(item.id);
              });
            }}
            disabled={isPending}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            Удалить
          </button>
        </div>
      </div>
    </article>
  );
}

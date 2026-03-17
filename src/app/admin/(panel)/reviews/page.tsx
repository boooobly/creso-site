import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { AdminPageSection } from '@/components/admin/AdminPageSection';
import ReviewActionButton from '@/components/admin/reviews/ReviewActionButton';
import { prisma } from '@/lib/db/prisma';
import { deleteReviewAction, setReviewStatusAction } from './actions';

const FILTERS = [
  { key: 'all', label: 'Все отзывы' },
  { key: 'pending', label: 'Нужно проверить' },
  { key: 'approved', label: 'Опубликовано' },
  { key: 'rejected', label: 'Скрыто / отклонено' }
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const successMessages: Record<string, string> = {
  published: 'Отзыв опубликован и уже виден на сайте.',
  hidden: 'Отзыв скрыт с сайта.',
  deleted: 'Отзыв удалён.',
  'returned-to-queue': 'Отзыв возвращён в очередь на проверку.'
};

type AdminReviewsPageProps = {
  searchParams?: {
    filter?: string;
    q?: string;
    success?: string;
    error?: string;
  };
};

function getFilter(raw?: string): FilterKey {
  if (!raw) return 'pending';
  return FILTERS.some((item) => item.key === raw) ? (raw as FilterKey) : 'pending';
}

function getStatusLabel(status: string) {
  if (status === 'approved') return 'Опубликован';
  if (status === 'rejected') return 'Скрыт';
  return 'Новый';
}

function getStatusBadgeClass(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-700';
  if (status === 'rejected') return 'bg-slate-200 text-slate-700';
  return 'bg-amber-100 text-amber-700';
}

function renderStars(rating: number) {
  return `${'★'.repeat(rating)}${'☆'.repeat(Math.max(0, 5 - rating))}`;
}

function buildFilterHref(filter: FilterKey, query: string) {
  const params = new URLSearchParams();
  if (filter !== 'pending') params.set('filter', filter);
  if (query) params.set('q', query);
  const next = params.toString();
  return `/admin/reviews${next ? `?${next}` : ''}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(value);
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const filter = getFilter(searchParams?.filter);
  const query = searchParams?.q?.trim() ?? '';

  const where: Prisma.ReviewWhereInput = {
    ...(filter !== 'all' ? { status: filter } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { text: { contains: query, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [reviews, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        name: true,
        isAnonymous: true,
        rating: true,
        text: true,
        status: true,
        createdAt: true
      }
    }),
    prisma.review.count(),
    prisma.review.count({ where: { status: 'pending' } }),
    prisma.review.count({ where: { status: 'approved' } }),
    prisma.review.count({ where: { status: 'rejected' } })
  ]);

  const counts: Record<FilterKey, number> = {
    all: total,
    pending: pendingCount,
    approved: approvedCount,
    rejected: rejectedCount
  };

  const hasFilters = Boolean(query || filter !== 'pending');
  const redirectSearchParams = new URLSearchParams();
  if (filter !== 'pending') redirectSearchParams.set('filter', filter);
  if (query) redirectSearchParams.set('q', query);

  const successMessage = searchParams?.success ? successMessages[searchParams.success] : null;

  return (
    <div className="space-y-6">
      <AdminPageSection
        title="Модерация отзывов"
        description="Проверьте новые отзывы, быстро опубликуйте подходящие и скройте те, которые не должны показываться на сайте."
      >
        {successMessage ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
        ) : null}

        {searchParams?.error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        ) : null}

        <form method="GET" className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_auto_auto]">
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Поиск по отзывам</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Имя клиента или текст отзыва"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            />
          </label>

          <input type="hidden" name="filter" value={filter} />

          <div className="flex items-end gap-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
              Найти
            </button>
            {hasFilters ? (
              <Link href="/admin/reviews" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Сбросить
              </Link>
            ) : null}
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Link
              key={item.key}
              href={buildFilterHref(item.key, query)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                filter === item.key
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label} · {counts[item.key]}
            </Link>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Найдено: <span className="font-semibold text-slate-900">{reviews.length}</span>
        </p>

        {reviews.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm font-medium text-slate-900">Отзывов по текущему фильтру пока нет</p>
            <p className="mt-1 text-sm text-slate-500">Попробуйте сменить фильтр или очистить поиск, чтобы увидеть другие отзывы.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((review) => {
              const authorLabel = review.isAnonymous ? 'Анонимный клиент' : review.name?.trim() || 'Без имени';
              const isVisibleOnSite = review.status === 'approved';

              return (
                <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{authorLabel}</p>
                      <p className="mt-0.5 text-xs text-slate-500">Добавлен: {formatDate(review.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex rounded-full px-2.5 py-1 font-medium ${getStatusBadgeClass(review.status)}`}>
                        {getStatusLabel(review.status)}
                      </span>
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                        На сайте: {isVisibleOnSite ? 'Да' : 'Нет'}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-medium text-amber-600" aria-label={`Оценка ${review.rating} из 5`}>
                    {renderStars(review.rating)}
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{review.text}</p>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    {review.status !== 'approved' ? (
                      <form action={setReviewStatusAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="nextStatus" value="approved" />
                        <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                        <ReviewActionButton
                          label="Опубликовать"
                          pendingLabel="Публикуем..."
                          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                        />
                      </form>
                    ) : (
                      <form action={setReviewStatusAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="nextStatus" value="rejected" />
                        <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                        <ReviewActionButton
                          label="Скрыть с сайта"
                          pendingLabel="Скрываем..."
                          className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
                        />
                      </form>
                    )}

                    {review.status === 'pending' ? (
                      <form action={setReviewStatusAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="nextStatus" value="rejected" />
                        <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                        <ReviewActionButton
                          label="Отклонить"
                          pendingLabel="Обновляем..."
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        />
                      </form>
                    ) : null}

                    {review.status === 'rejected' ? (
                      <form action={setReviewStatusAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="nextStatus" value="pending" />
                        <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                        <ReviewActionButton
                          label="Вернуть на проверку"
                          pendingLabel="Обновляем..."
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        />
                      </form>
                    ) : null}

                    <form action={deleteReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                      <ReviewActionButton
                        label="Удалить"
                        pendingLabel="Удаляем..."
                        confirmText="Удалить этот отзыв без возможности восстановления?"
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                      />
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </AdminPageSection>
    </div>
  );
}

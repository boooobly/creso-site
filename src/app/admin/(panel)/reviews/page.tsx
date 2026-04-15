import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { AdminPageSection } from '@/components/admin/AdminPageSection';
import { AdminAlert, AdminButton, AdminEmptyState } from '@/components/admin/ui';
import ReviewActionButton from '@/components/admin/reviews/ReviewActionButton';
import { prisma } from '@/lib/db/prisma';
import { deleteReviewAction, setReviewStatusAction } from './actions';

const FILTERS = [
  { key: 'all', label: 'Все', hint: 'вся история' },
  { key: 'pending', label: 'Нужно проверить', hint: 'приоритет' },
  { key: 'approved', label: 'Опубликованные', hint: 'видны на сайте' },
  { key: 'rejected', label: 'Скрытые', hint: 'не показываются' }
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const successMessages: Record<string, string> = {
  published: 'Готово: отзыв теперь виден на сайте.',
  hidden: 'Готово: отзыв скрыт с сайта.',
  deleted: 'Готово: отзыв удалён.',
  'returned-to-queue': 'Готово: отзыв снова в очереди на проверку.'
};

type AdminReviewsPageProps = {
  searchParams?: Promise<{
    filter?: string;
    q?: string;
    success?: string;
    error?: string;
  }>;
};

function getFilter(raw?: string): FilterKey {
  if (!raw) return 'pending';
  return FILTERS.some((item) => item.key === raw) ? (raw as FilterKey) : 'pending';
}

function getStatusLabel(status: string) {
  if (status === 'approved') return 'Опубликован';
  if (status === 'rejected') return 'Скрыт';
  return 'Ждёт проверки';
}

function getStatusBadgeClass(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (status === 'rejected') return 'bg-slate-100 text-slate-700 border border-slate-200';
  return 'bg-amber-50 text-amber-700 border border-amber-200';
}

function getCardClass(status: string) {
  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50/30 ring-1 ring-amber-100';
  }

  return 'border-slate-200 bg-white';
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

function getTextPreview(text: string, limit = 260) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}…`;
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const resolvedSearchParams = await searchParams;
  const filter = getFilter(resolvedSearchParams?.filter);
  const query = resolvedSearchParams?.q?.trim() ?? '';

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

  const successMessage = resolvedSearchParams?.success ? successMessages[resolvedSearchParams.success] : null;

  return (
    <div className="space-y-6">
      <AdminPageSection
        title="Отзывы клиентов"
        description="Сначала проверьте новые отзывы. Остальные можно найти через фильтры ниже."
      >
        {pendingCount > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Сейчас ждут проверки: <span className="font-semibold">{pendingCount}</span>
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Очередь чистая — новых отзывов на проверку нет.
          </div>
        )}

        {successMessage ? (
          <AdminAlert tone="success" className="mt-3">{successMessage}</AdminAlert>
        ) : null}

        {resolvedSearchParams?.error ? (
          <AdminAlert tone="error" className="mt-3">{resolvedSearchParams.error}</AdminAlert>
        ) : null}

        <form method="GET" className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Быстрый поиск</span>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Имя клиента или фраза из отзыва"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
              />
            </label>

            <div className="flex items-end gap-2 max-sm:flex-col max-sm:items-stretch">
              <AdminButton type="submit" variant="primary" className="px-4">
                Показать
              </AdminButton>
              <input type="hidden" name="filter" value={filter} />
              {hasFilters ? (
                <Link href="/admin/reviews">
                  <AdminButton variant="secondary" className="px-4">Сбросить всё</AdminButton>
                </Link>
              ) : null}
            </div>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Link
              key={item.key}
              href={buildFilterHref(item.key, query)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                filter === item.key
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="font-semibold">{item.label}</span>
              <span className={`ml-1.5 text-xs ${filter === item.key ? 'text-slate-200' : 'text-slate-500'}`}>{item.hint}</span>
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${filter === item.key ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {counts[item.key]}
              </span>
            </Link>
          ))}
        </div>

        {reviews.length === 0 ? (
          <div className="mt-4">
            <AdminEmptyState
              title="Ничего не найдено"
              description="Попробуйте другой фильтр или нажмите «Сбросить всё», чтобы вернуться к общей ленте."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((review) => {
              const authorLabel = review.isAnonymous ? 'Анонимный клиент' : review.name?.trim() || 'Клиент без имени';
              const isVisibleOnSite = review.status === 'approved';
              const isLongText = review.text.length > 260;

              return (
                <article key={review.id} className={`rounded-xl border p-4 shadow-sm ${getCardClass(review.status)}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">{authorLabel}</p>
                      <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex rounded-full px-2.5 py-1 font-medium ${getStatusBadgeClass(review.status)}`}>
                        {getStatusLabel(review.status)}
                      </span>
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
                        На сайте: {isVisibleOnSite ? 'Да' : 'Нет'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <p className="font-medium text-amber-600" aria-label={`Оценка ${review.rating} из 5`}>
                      {renderStars(review.rating)}
                    </p>
                    {review.status === 'pending' ? <p className="text-xs font-medium text-amber-700">Нужно решение: опубликовать или скрыть</p> : null}
                  </div>

                  <div className="mt-3 rounded-lg bg-white/80 p-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{getTextPreview(review.text)}</p>
                    {isLongText ? (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900">Показать полный текст</summary>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{review.text}</p>
                      </details>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/70 pt-3">
                    {review.status !== 'approved' ? (
                      <form action={setReviewStatusAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="nextStatus" value="approved" />
                        <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                        <ReviewActionButton
                          label="Опубликовать"
                          pendingLabel="Публикуем..."
                          variant="primary"
                        />
                      </form>
                    ) : (
                      <form action={setReviewStatusAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="nextStatus" value="rejected" />
                        <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                        <ReviewActionButton
                          label="Скрыть"
                          pendingLabel="Скрываем..."
                          variant="secondary"
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
                          pendingLabel="Сохраняем..."
                          variant="secondary"
                        />
                      </form>
                    ) : null}

                    {review.status === 'rejected' ? (
                      <form action={setReviewStatusAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="nextStatus" value="pending" />
                        <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                        <ReviewActionButton
                          label="Вернуть в новые"
                          pendingLabel="Сохраняем..."
                          variant="secondary"
                        />
                      </form>
                    ) : null}

                    <form action={deleteReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="redirectSearchParams" value={redirectSearchParams.toString()} />
                      <ReviewActionButton
                        label="Удалить"
                        pendingLabel="Удаляем..."
                        confirmText="Вы точно хотите удалить отзыв? Восстановить его не получится."
                        variant="danger"
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

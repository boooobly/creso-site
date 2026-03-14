import Link from 'next/link';
import { listPortfolioItems } from '@/lib/admin/portfolio-service';
import {
  quickTogglePortfolioFeaturedAction,
  quickTogglePortfolioPublishAction,
  removePortfolioItemAction
} from './actions';
import PortfolioItemsGrid from '@/components/admin/portfolio/PortfolioItemsGrid';

type AdminPortfolioPageProps = {
  searchParams?: {
    search?: string;
    category?: string;
    status?: 'all' | 'published' | 'hidden';
    success?: 'created' | 'updated' | 'deleted';
  };
};

const successMap = {
  created: 'Работа успешно добавлена.',
  updated: 'Изменения сохранены.',
  deleted: 'Работа удалена.'
} as const;

export default async function AdminPortfolioPage({ searchParams }: AdminPortfolioPageProps) {
  const search = searchParams?.search?.trim() ?? '';
  const category = searchParams?.category?.trim() ?? '';
  const status = searchParams?.status ?? 'all';
  const published = status === 'all' ? undefined : status === 'published';

  let items = [] as Awaited<ReturnType<typeof listPortfolioItems>>['items'];
  let databaseError: string | null = null;

  try {
    const result = await listPortfolioItems({
      page: 1,
      pageSize: 60,
      search: search || undefined,
      category: category || undefined,
      published
    });
    items = result.items;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось загрузить данные.';
    databaseError = message.startsWith('[env]')
      ? 'База данных пока не подключена. Укажите ENABLE_DATABASE=true и DATABASE_URL.'
      : 'Не удалось загрузить список работ. Попробуйте позже.';
  }

  const categories = Array.from(new Set(items.map((item) => item.category))).sort((a, b) => a.localeCompare(b, 'ru'));
  const successMessage = searchParams?.success ? successMap[searchParams.success] : null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Портфолио работ</h2>
            <p className="mt-1 text-sm text-slate-600">
              Добавляйте и редактируйте выполненные проекты, чтобы посетители видели актуальные примеры работ.
            </p>
          </div>

          <Link
            href="/admin/portfolio/new"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Добавить работу
          </Link>
        </div>

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}
        {databaseError ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {databaseError}
          </p>
        ) : null}

        <form className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
              Поиск
            </label>
            <input
              id="search"
              name="search"
              defaultValue={search}
              placeholder="Название, категория или описание"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
              Категория
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Все категории</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
              Статус
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">Все</option>
              <option value="published">Опубликованные</option>
              <option value="hidden">Скрытые</option>
            </select>
          </div>

          <div className="md:col-span-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Применить фильтры
            </button>
            <Link
              href="/admin/portfolio"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Сбросить
            </Link>
          </div>
        </form>
      </section>

      {!databaseError && items.length === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Пока нет ни одной работы</h3>
          <p className="mt-2 text-sm text-slate-600">Добавьте первую работу, чтобы начать наполнять портфолио.</p>
          <Link
            href="/admin/portfolio/new"
            className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Добавить работу
          </Link>
        </section>
      ) : databaseError ? null : (
        <PortfolioItemsGrid
          items={items}
          onTogglePublish={quickTogglePortfolioPublishAction}
          onToggleFeatured={quickTogglePortfolioFeaturedAction}
          onDelete={removePortfolioItemAction}
        />
      )}
    </div>
  );
}

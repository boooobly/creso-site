import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { AdminPageSection } from '@/components/admin/AdminPageSection';
import { AdminEmptyState } from '@/components/admin/ui';
import { prisma } from '@/lib/db/prisma';
import {
  formatAdminDateTime,
  formatMoneyRub,
  formatNullableText,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  getPaymentStatusBadgeClass,
  getPaymentStatusLabel,
  ORDER_STATUSES,
  PAYMENT_STATUSES
} from '@/lib/admin/orders';

const PAGE_SIZE = 20;

type OrdersPageProps = {
  searchParams?: {
    q?: string;
    status?: string;
    paymentStatus?: string;
    page?: string;
  };
};

function getPageNumber(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const query = searchParams?.q?.trim() ?? '';
  const statusFilter = searchParams?.status?.trim() ?? '';
  const paymentStatusFilter = searchParams?.paymentStatus?.trim() ?? '';
  const page = getPageNumber(searchParams?.page);
  const hasFilters = Boolean(query || statusFilter || paymentStatusFilter);

  const where: Prisma.OrderWhereInput = {
    ...(query
      ? {
          OR: [
            { number: { contains: query, mode: 'insensitive' } },
            { customerName: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(paymentStatusFilter ? { paymentStatus: paymentStatusFilter } : {})
  };

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE
    }),
    prisma.order.count({ where })
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const hasPrevious = safePage > 1;
  const hasNext = safePage < totalPages;

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (statusFilter) params.set('status', statusFilter);
    if (paymentStatusFilter) params.set('paymentStatus', paymentStatusFilter);
    if (targetPage > 1) params.set('page', String(targetPage));
    const stringified = params.toString();
    return `/admin/orders${stringified ? `?${stringified}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageSection
        title="Заказы"
        description="Все заявки в одном месте: быстрый поиск, фильтрация и переход в карточку заказа."
      >
        <form className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]" method="GET">
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Поиск</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Номер, имя, телефон или email"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Статус заказа</span>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            >
              <option value="">Все</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Статус оплаты</span>
            <select
              name="paymentStatus"
              defaultValue={paymentStatusFilter}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            >
              <option value="">Все</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>{getPaymentStatusLabel(status)}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700" type="submit">
              Применить
            </button>
            {hasFilters ? (
              <Link href="/admin/orders" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Очистить
              </Link>
            ) : null}
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p>
            Найдено заказов: <span className="font-semibold text-slate-900">{totalCount}</span>
          </p>
          {hasFilters ? <p className="text-xs text-slate-500">Фильтры сохранены в URL — ссылкой можно делиться.</p> : null}
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          {orders.length === 0 ? (
            <div className="p-6">
              <AdminEmptyState
                title="По текущим условиям заказы не найдены"
                description="Измените параметры поиска или сбросьте фильтры, чтобы увидеть все заявки."
              />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Заказ</th>
                  <th className="px-3 py-2">Клиент</th>
                  <th className="px-3 py-2">Источник</th>
                  <th className="px-3 py-2">Сумма</th>
                  <th className="px-3 py-2">Предоплата</th>
                  <th className="px-3 py-2">Оплата</th>
                  <th className="px-3 py-2">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-semibold text-slate-900 underline-offset-2 hover:underline">
                        #{order.number}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{formatAdminDateTime(order.createdAt)}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      <p className="font-medium text-slate-900">{formatNullableText(order.customerName)}</p>
                      <p className="text-xs text-slate-600">{formatNullableText(order.phone)}</p>
                      <p className="text-xs text-slate-600">{formatNullableText(order.email)}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{formatNullableText(order.source)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold text-slate-900">{formatMoneyRub(order.total)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {order.prepayRequired ? `Да · ${formatMoneyRub(order.prepayAmount)}` : 'Нет'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getOrderStatusBadgeClass(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Страница {safePage} из {totalPages}</span>
          <div className="flex items-center gap-2">
            <Link
              href={hasPrevious ? buildPageHref(safePage - 1) : '#'}
              aria-disabled={!hasPrevious}
              className={`rounded-md border px-3 py-1.5 ${
                hasPrevious ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'pointer-events-none border-slate-200 text-slate-400'
              }`}
            >
              Назад
            </Link>
            <Link
              href={hasNext ? buildPageHref(safePage + 1) : '#'}
              aria-disabled={!hasNext}
              className={`rounded-md border px-3 py-1.5 ${
                hasNext ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'pointer-events-none border-slate-200 text-slate-400'
              }`}
            >
              Вперед
            </Link>
          </div>
        </div>
      </AdminPageSection>
    </div>
  );
}

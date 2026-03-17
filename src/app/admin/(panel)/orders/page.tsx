import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { AdminPageSection } from '@/components/admin/AdminPageSection';
import { prisma } from '@/lib/db/prisma';
import {
  formatAdminDateTime,
  formatMoneyRub,
  getOrderStatusLabel,
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
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

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
        description="Поиск и фильтрация заказов по клиенту, статусу и оплате. По умолчанию показываются новые сверху."
      >
        <form className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-4" method="GET">
          <label className="md:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Поиск</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Номер, имя, телефон или email"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            />
          </label>

          <label>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Статус заказа</span>
            <select
              name="status"
              defaultValue={statusFilter}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            >
              <option value="">Все</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Статус оплаты</span>
            <select
              name="paymentStatus"
              defaultValue={paymentStatusFilter}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            >
              <option value="">Все</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>{getPaymentStatusLabel(status)}</option>
              ))}
            </select>
          </label>

          <div className="md:col-span-4 flex flex-wrap items-center gap-2">
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700" type="submit">
              Применить
            </button>
            <Link href="/admin/orders" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Сбросить
            </Link>
          </div>
        </form>

        <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
          {orders.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">Заказы не найдены. Попробуйте изменить фильтры.</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Номер</th>
                  <th className="px-3 py-2">Дата</th>
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
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-900">
                      <Link href={`/admin/orders/${order.id}`} className="underline-offset-2 hover:underline">
                        #{order.number}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{formatAdminDateTime(order.createdAt)}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <p className="font-medium text-slate-900">{order.customerName || '—'}</p>
                      <p>{order.phone || '—'}</p>
                      <p>{order.email || '—'}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{order.source}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-900">{formatMoneyRub(order.total)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {order.prepayRequired ? `Да · ${formatMoneyRub(order.prepayAmount)}` : 'Нет'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">{getPaymentStatusLabel(order.paymentStatus)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">{getOrderStatusLabel(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>Всего: {totalCount}</p>
          <div className="flex items-center gap-2">
            <Link
              href={hasPrevious ? buildPageHref(page - 1) : '#'}
              aria-disabled={!hasPrevious}
              className={`rounded-md border px-3 py-1.5 ${
                hasPrevious ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'cursor-not-allowed border-slate-200 text-slate-400'
              }`}
            >
              Назад
            </Link>
            <span>
              Страница {Math.min(page, totalPages)} из {totalPages}
            </span>
            <Link
              href={hasNext ? buildPageHref(page + 1) : '#'}
              aria-disabled={!hasNext}
              className={`rounded-md border px-3 py-1.5 ${
                hasNext ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'cursor-not-allowed border-slate-200 text-slate-400'
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

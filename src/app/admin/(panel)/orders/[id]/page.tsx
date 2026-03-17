import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPageSection } from '@/components/admin/AdminPageSection';
import { prisma } from '@/lib/db/prisma';
import {
  formatAdminDateTime,
  formatJsonForAdmin,
  formatMoneyRub,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  ORDER_STATUSES,
  PAYMENT_STATUSES
} from '@/lib/admin/orders';
import { updateOrderAdminAction } from '../actions';

type OrderDetailPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    success?: string;
    error?: string;
  };
};

export default async function AdminOrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });

  if (!order) notFound();

  const submitAction = updateOrderAdminAction.bind(null, order.id);
  const success = searchParams?.success === 'saved';
  const error = searchParams?.error === 'validation';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/orders" className="inline-flex text-sm text-slate-600 transition hover:text-slate-900">← Назад к заказам</Link>
      </div>

      {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Данные заказа сохранены.</p> : null}
      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Проверьте статус заказа и статус оплаты.</p> : null}

      <AdminPageSection
        title={`Заказ #${order.number}`}
        description="Карточка заказа с источником, оплатой, JSON-данными расчета и внутренними заметками."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Основное</h3>
            <p><span className="text-slate-500">ID:</span> {order.id}</p>
            <p><span className="text-slate-500">Номер:</span> {order.number}</p>
            <p><span className="text-slate-500">Источник:</span> {order.source}</p>
            <p><span className="text-slate-500">Статус заказа:</span> {getOrderStatusLabel(order.status)}</p>
            <p><span className="text-slate-500">Клиент:</span> {order.customerName || '—'}</p>
            <p><span className="text-slate-500">Телефон:</span> {order.phone || '—'}</p>
            <p><span className="text-slate-500">Email:</span> {order.email || '—'}</p>
            <p><span className="text-slate-500">Комментарий клиента:</span> {order.comment || '—'}</p>
          </article>

          <article className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Оплата и суммы</h3>
            <p><span className="text-slate-500">Итого:</span> {formatMoneyRub(order.total)}</p>
            <p><span className="text-slate-500">Предоплата обязательна:</span> {order.prepayRequired ? 'Да' : 'Нет'}</p>
            <p><span className="text-slate-500">Сумма предоплаты:</span> {order.prepayRequired ? formatMoneyRub(order.prepayAmount) : '—'}</p>
            <p><span className="text-slate-500">Статус оплаты:</span> {getPaymentStatusLabel(order.paymentStatus)}</p>
            <p><span className="text-slate-500">Платежный провайдер:</span> {order.paymentProvider || '—'}</p>
            <p><span className="text-slate-500">Референс платежа:</span> {order.paymentRef || '—'}</p>
            <p><span className="text-slate-500">Оплачено:</span> {order.paidAmount ? formatMoneyRub(order.paidAmount) : '—'}</p>
            <p><span className="text-slate-500">Дата оплаты:</span> {formatAdminDateTime(order.paidAt)}</p>
          </article>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Служебные отметки</h3>
          <p className="mt-2 text-sm text-slate-700"><span className="text-slate-500">Создан:</span> {formatAdminDateTime(order.createdAt)}</p>
          <p className="text-sm text-slate-700"><span className="text-slate-500">Обновлен:</span> {formatAdminDateTime(order.updatedAt)}</p>
        </div>
      </AdminPageSection>

      <AdminPageSection
        title="Действия менеджера"
        description="Обновите статусы и внутреннюю заметку."
      >
        <form action={submitAction} className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Статус заказа</span>
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Статус оплаты</span>
            <select
              name="paymentStatus"
              defaultValue={order.paymentStatus}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>{getPaymentStatusLabel(status)}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-slate-700 lg:col-span-2">
            <span className="font-medium">Внутренняя заметка</span>
            <textarea
              name="managerNote"
              defaultValue={order.managerNote ?? ''}
              rows={6}
              placeholder="Заметка видна только менеджерам"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
            />
          </label>

          <div className="lg:col-span-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
              Сохранить изменения
            </button>
          </div>
        </form>
      </AdminPageSection>

      <AdminPageSection
        title="JSON данные"
        description="Полезно для диагностики входных данных и расчета цены."
      >
        <div className="space-y-4">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">payloadJson</h3>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-white p-3 text-xs text-slate-700">{formatJsonForAdmin(order.payloadJson)}</pre>
          </article>

          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">quoteJson</h3>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-white p-3 text-xs text-slate-700">{formatJsonForAdmin(order.quoteJson)}</pre>
          </article>
        </div>
      </AdminPageSection>
    </div>
  );
}

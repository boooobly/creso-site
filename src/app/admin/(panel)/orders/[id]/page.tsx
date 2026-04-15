import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPageSection } from '@/components/admin/AdminPageSection';
import { prisma } from '@/lib/db/prisma';
import { getPersistedBagetOrderSummary } from '@/lib/orders/bagetOrderSummary';
import {
  formatAdminBoolean,
  formatAdminDateTime,
  formatJsonForAdmin,
  formatMoneyRub,
  formatNullableText,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  getPaymentStatusBadgeClass,
  getPaymentStatusLabel,
  ORDER_STATUSES,
  PAYMENT_STATUSES
} from '@/lib/admin/orders';
import SubmitOrderUpdateButton from '../SubmitOrderUpdateButton';
import { updateOrderAdminAction } from '../actions';

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-slate-700">
      <span className="text-slate-500">{label}:</span> {value}
    </p>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[220px_1fr] sm:items-start">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export default async function AdminOrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const order = await prisma.order.findUnique({ where: { id: resolvedParams.id } });

  if (!order) notFound();

  const submitAction = updateOrderAdminAction.bind(null, order.id);
  const success = resolvedSearchParams?.success === 'saved';
  const error = resolvedSearchParams?.error === 'validation';
  const bagetSummary = getPersistedBagetOrderSummary(order.payloadJson, order.quoteJson);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/orders" className="inline-flex text-sm text-slate-600 transition hover:text-slate-900">← Назад к заказам</Link>
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getOrderStatusBadgeClass(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
            {getPaymentStatusLabel(order.paymentStatus)}
          </span>
        </div>
      </div>

      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Изменения сохранены. Статусы и заметка обновлены.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Не удалось сохранить изменения. Проверьте выбранные статусы и повторите попытку.
        </p>
      ) : null}

      <AdminPageSection
        title={`Заказ #${order.number}`}
        description="Ключевая коммерческая информация находится в верхних карточках."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Сумма заказа</h3>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatMoneyRub(order.total)}</p>
            <p className="mt-1 text-sm text-slate-600">Предоплата: {order.prepayRequired ? formatMoneyRub(order.prepayAmount) : 'не требуется'}</p>
            <p className="text-sm text-slate-600">Оплачено: {order.paidAmount ? formatMoneyRub(order.paidAmount) : '—'}</p>
          </article>

          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Клиент</h3>
            <div className="mt-2 space-y-1">
              <InfoRow label="Имя" value={formatNullableText(order.customerName)} />
              <InfoRow label="Телефон" value={formatNullableText(order.phone)} />
              <InfoRow label="Email" value={formatNullableText(order.email)} />
              <InfoRow label="Комментарий" value={formatNullableText(order.comment)} />
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Заказ</h3>
            <div className="mt-2 space-y-1">
              <InfoRow label="ID" value={order.id} />
              <InfoRow label="Номер" value={order.number} />
              <InfoRow label="Источник" value={formatNullableText(order.source)} />
              <InfoRow label="Предоплата обязательна" value={formatAdminBoolean(order.prepayRequired)} />
              <InfoRow label="Создан" value={formatAdminDateTime(order.createdAt)} />
              <InfoRow label="Обновлен" value={formatAdminDateTime(order.updatedAt)} />
            </div>
          </article>
        </div>
      </AdminPageSection>

      {bagetSummary ? (
        <AdminPageSection title="Детали заказа багета" description="Человекочитаемая сводка для менеджера и производства.">
          <dl className="space-y-3">
            <DetailRow
              label="Артикул багета"
              value={bagetSummary.baguette?.article || (bagetSummary.frameMode.value === 'noFrame' ? 'Без рамки' : '—')}
            />
            <DetailRow label="Название багета" value={bagetSummary.baguette?.name || '—'} />
            <DetailRow
              label="Размер"
              value={
                <div className="space-y-1">
                  <p>Работа: {bagetSummary.size.workWidthMm} × {bagetSummary.size.workHeightMm} мм</p>
                  <p>Эффективный: {bagetSummary.size.effectiveWidthMm} × {bagetSummary.size.effectiveHeightMm} мм</p>
                  {bagetSummary.size.outerWidthMm && bagetSummary.size.outerHeightMm ? (
                    <p>Габарит с рамкой: {bagetSummary.size.outerWidthMm} × {bagetSummary.size.outerHeightMm} мм</p>
                  ) : null}
                </div>
              }
            />
            <DetailRow label="Тип работы" value={bagetSummary.workType.label} />
            <DetailRow label="Остекление" value={bagetSummary.glazing.label} />
            <DetailRow label="Паспарту" value={bagetSummary.passepartout.label} />
            <DetailRow label="Задник" value={bagetSummary.backPanel.label} />
            <DetailRow
              label="Материалы включены"
              value={bagetSummary.materialsBreakdown.length ? (
                <ul className="list-disc space-y-1 pl-5">
                  {bagetSummary.materialsBreakdown.map((item) => (
                    <li key={item.key}>
                      <span className="font-medium">{item.label}</span>
                      {item.note ? ` — ${item.note}` : ''}
                    </li>
                  ))}
                </ul>
              ) : '—'}
            />
            <DetailRow
              label="Печать"
              value={bagetSummary.printRequirement.requiresPrint
                ? `${bagetSummary.printRequirement.printMaterialLabel || 'Да'}${bagetSummary.printRequirement.transferSourceLabel ? `, источник: ${bagetSummary.printRequirement.transferSourceLabel}` : ''}`
                : 'Не требуется'}
            />
            <DetailRow
              label="Файл клиента"
              value={bagetSummary.uploadedImage ? (
                <div className="space-y-1">
                  <p>{bagetSummary.uploadedImage.fileName}</p>
                  <p className="text-slate-600">MIME: {bagetSummary.uploadedImage.mimeType || '—'}</p>
                  <p className="text-slate-600">Размер: {bagetSummary.uploadedImage.sizeBytes ? `${Math.round(bagetSummary.uploadedImage.sizeBytes / 1024)} КБ` : '—'}</p>
                  <Link
                    href={bagetSummary.uploadedImage.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
                  >
                    Открыть оригинал
                  </Link>
                </div>
              ) : 'Файл не загружен'}
            />
          </dl>
        </AdminPageSection>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPageSection title="Оплата" description="Технические детали платежа по заказу.">
          <div className="space-y-1">
            <InfoRow label="Статус" value={getPaymentStatusLabel(order.paymentStatus)} />
            <InfoRow label="Провайдер" value={formatNullableText(order.paymentProvider)} />
            <InfoRow label="Референс" value={formatNullableText(order.paymentRef)} />
            <InfoRow label="Сумма оплаты" value={order.paidAmount ? formatMoneyRub(order.paidAmount) : '—'} />
            <InfoRow label="Дата оплаты" value={formatAdminDateTime(order.paidAt)} />
          </div>
        </AdminPageSection>

        <AdminPageSection title="Действия менеджера" description="Безопасное обновление статусов и внутренней заметки.">
          <form action={submitAction} className="grid gap-4">
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

            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Внутренняя заметка</span>
              <textarea
                name="managerNote"
                defaultValue={order.managerNote ?? ''}
                rows={6}
                placeholder="Например: клиент попросил уточнить сроки отгрузки"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring"
              />
            </label>

            <div>
              <SubmitOrderUpdateButton />
              <p className="mt-2 text-xs text-slate-500">Кнопка блокируется на время сохранения, чтобы избежать случайного повторного отправления.</p>
            </div>
          </form>
        </AdminPageSection>

        <AdminPageSection title="Служебные поля" description="Системная информация о заявке.">
          <div className="space-y-1">
            <InfoRow label="Статус заказа" value={getOrderStatusLabel(order.status)} />
            <InfoRow label="Статус оплаты" value={getPaymentStatusLabel(order.paymentStatus)} />
            <InfoRow label="Менеджерская заметка" value={formatNullableText(order.managerNote)} />
          </div>
        </AdminPageSection>
      </div>

      <AdminPageSection title="payloadJson" description="Входные данные заявки в читаемом формате.">
        <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">{formatJsonForAdmin(order.payloadJson)}</pre>
      </AdminPageSection>

      <AdminPageSection title="quoteJson" description="Расчет стоимости и служебные параметры.">
        <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">{formatJsonForAdmin(order.quoteJson)}</pre>
      </AdminPageSection>
    </div>
  );
}

export const ORDER_STATUSES = [
  'new',
  'in_progress',
  'awaiting_payment',
  'paid',
  'completed',
  'cancelled'
] as const;

export const MANAGER_ORDER_STATUSES = ['new', 'in_progress', 'completed', 'cancelled'] as const;

export const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'refunded'] as const;

const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  awaiting_payment: 'Архивный: awaiting_payment',
  paid: 'Архивный: paid',
  completed: 'Выполнен',
  cancelled: 'Отменен'
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Не оплачено',
  pending: 'Ожидает оплаты',
  paid: 'Оплачено',
  failed: 'Ошибка оплаты',
  refunded: 'Возврат'
};

const ORDER_STATUS_BADGE_CLASSES: Record<string, string> = {
  new: 'bg-sky-100 text-sky-800',
  in_progress: 'bg-amber-100 text-amber-800',
  awaiting_payment: 'bg-violet-100 text-violet-800',
  paid: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-rose-100 text-rose-800'
};

const PAYMENT_STATUS_BADGE_CLASSES: Record<string, string> = {
  unpaid: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-rose-100 text-rose-800',
  refunded: 'bg-indigo-100 text-indigo-800'
};

export function getOrderStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getPaymentStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function getOrderStatusBadgeClass(status: string | null | undefined): string {
  if (!status) return 'bg-slate-100 text-slate-700';
  return ORDER_STATUS_BADGE_CLASSES[status] ?? 'bg-slate-100 text-slate-700';
}

export function getPaymentStatusBadgeClass(status: string | null | undefined): string {
  if (!status) return 'bg-slate-100 text-slate-700';
  return PAYMENT_STATUS_BADGE_CLASSES[status] ?? 'bg-slate-100 text-slate-700';
}

export function formatAdminDateTime(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ru-RU');
}

export function formatMoneyRub(amount: number | null | undefined): string {
  return `${Math.round(Number(amount ?? 0)).toLocaleString('ru-RU')} ₽`;
}

export function formatAdminBoolean(value: boolean | null | undefined): string {
  if (typeof value !== 'boolean') return '—';
  return value ? 'Да' : 'Нет';
}

export function formatNullableText(value: string | null | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : '—';
}

export function formatJsonForAdmin(value: unknown): string {
  if (value == null) return '—';

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return 'Не удалось отобразить JSON';
  }
}

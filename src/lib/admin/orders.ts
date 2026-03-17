export const ORDER_STATUSES = [
  'new',
  'in_progress',
  'awaiting_payment',
  'paid',
  'completed',
  'cancelled'
] as const;

export const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'refunded'] as const;

const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  awaiting_payment: 'Ожидает оплату',
  paid: 'Оплачен',
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

export function getOrderStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getPaymentStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return PAYMENT_STATUS_LABELS[status] ?? status;
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

export function formatJsonForAdmin(value: unknown): string {
  if (value == null) return '—';

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return 'Не удалось отобразить JSON';
  }
}

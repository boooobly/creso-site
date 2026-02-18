import type { BagetQuoteResult } from '@/lib/calculations/bagetQuote';
import { sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';

type NotifyNewOrderPayload = {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    comment?: string;
  };
  effectiveSize: {
    width: number;
    height: number;
  };
  quote: BagetQuoteResult;
  prepayRequired: boolean;
  prepayAmount: number | null;
};

function formatValue(value?: string | number | null): string {
  if (value === null || value === undefined) return '—';
  const text = String(value).trim();
  return text || '—';
}

function buildItemsText(quote: BagetQuoteResult): string {
  if (quote.items.length === 0) return '—';
  return quote.items
    .map((item) => `• ${item.title}: ${Math.round(item.total).toLocaleString('ru-RU')} ₽`)
    .join('\n');
}

function buildNotificationText(payload: NotifyNewOrderPayload): string {
  return [
    '🧾 Новый заказ багета',
    `Номер заказа: ${payload.orderNumber}`,
    `Имя: ${formatValue(payload.customer.name)}`,
    `Телефон: ${formatValue(payload.customer.phone)}`,
    `Email: ${formatValue(payload.customer.email)}`,
    `Комментарий: ${formatValue(payload.customer.comment)}`,
    `Размер (эффективный): ${Math.round(payload.effectiveSize.width)} × ${Math.round(payload.effectiveSize.height)} мм`,
    'Позиции:',
    buildItemsText(payload.quote),
    `Итого: ${Math.round(payload.quote.total).toLocaleString('ru-RU')} ₽`,
    `Предоплата обязательна: ${payload.prepayRequired ? 'Да' : 'Нет'}`,
    `Сумма предоплаты: ${payload.prepayAmount ? `${payload.prepayAmount.toLocaleString('ru-RU')} ₽` : '—'}`,
  ].join('\n');
}

function buildHtml(text: string) {
  return `<div style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.5;">${text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</div>`;
}

export async function notifyNewOrder(payload: NotifyNewOrderPayload): Promise<void> {
  const text = buildNotificationText(payload);

  await Promise.all([
    sendTelegramLead(text).catch((error) => {
      console.error('[orders] Telegram send failed', error);
    }),
    sendEmailLead({
      subject: `Новый заказ багета: ${payload.orderNumber}`,
      html: buildHtml(text),
    }).catch((error) => {
      console.error('[orders] Email send failed', error);
    }),
  ]);
}

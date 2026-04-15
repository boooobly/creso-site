import type { BagetQuoteResult } from '@/lib/calculations/bagetQuote';
import { getServerEnv } from '@/lib/env';
import type { BagetOrderSummaryData } from '@/lib/orders/bagetOrderSummary';
import { sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramDocumentBuffer, sendTelegramLead } from '@/lib/notifications/telegram';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { logger } from '@/lib/logger';

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
  orderSummary: BagetOrderSummaryData;
  customerImageFile?: File | null;
};

function formatValue(value?: string | number | null): string {
  if (value === null || value === undefined) return '—';
  const text = String(value).trim();
  return text || '—';
}

function formatMoney(value?: number | null): string {
  return `${Math.round(Number(value ?? 0)).toLocaleString('ru-RU')} ₽`;
}

function buildItemsText(quote: BagetQuoteResult): string {
  if (quote.items.length === 0) return '—';
  return quote.items
    .map((item) => `• ${item.title}: ${formatMoney(item.total)}`)
    .join('\n');
}

function buildMaterialsText(summary: BagetOrderSummaryData): string {
  if (!summary.materialsBreakdown.length) return '• Доп. материалы не добавлены';

  return summary.materialsBreakdown
    .map((item) => {
      const parts = [item.label];
      if (item.note) parts.push(item.note);
      return `• ${parts.join(' — ')}`;
    })
    .join('\n');
}

function buildNotificationText(payload: NotifyNewOrderPayload): string {
  const bagetName = payload.orderSummary.baguette?.name;
  const bagetArticle = payload.orderSummary.baguette?.article;
  const bagetWidth = payload.orderSummary.baguette?.widthMm;
  const bagetColor = payload.orderSummary.baguette?.color;
  const bagetLine = payload.orderSummary.frameMode.value === 'noFrame'
    ? 'Без рамки'
    : `${bagetArticle ? `АРТ. ${bagetArticle}` : 'Без артикула'}${bagetName ? ` — ${bagetName}` : ''}`;
  const uploadedImage = payload.orderSummary.uploadedImage;

  return [
    '🧾 Новый заказ багета',
    `Номер заказа: ${payload.orderNumber}`,
    '',
    'Клиент:',
    `• Имя: ${formatValue(payload.customer.name)}`,
    `• Телефон: ${formatValue(payload.customer.phone)}`,
    `• Email: ${formatValue(payload.customer.email)}`,
    `• Комментарий: ${formatValue(payload.customer.comment)}`,
    '',
    'Параметры заказа:',
    `• Размер работы: ${payload.orderSummary.size.workWidthMm} × ${payload.orderSummary.size.workHeightMm} мм`,
    `• Эффективный размер: ${Math.round(payload.effectiveSize.width)} × ${Math.round(payload.effectiveSize.height)} мм`,
    `• Багет: ${bagetLine}`,
    `• Цвет / стиль: ${formatValue([bagetColor, payload.orderSummary.baguette?.style].filter(Boolean).join(' / ') || null)}`,
    `• Ширина профиля: ${bagetWidth ? `${Math.round(bagetWidth)} мм` : '—'}`,
    `• Тип работы: ${payload.orderSummary.workType.label}`,
    `• Остекление: ${payload.orderSummary.glazing.label}`,
    `• Паспарту: ${payload.orderSummary.passepartout.label}`,
    `• Задник: ${payload.orderSummary.backPanel.label}`,
    `• Подвес: ${payload.orderSummary.hanging.label}${payload.orderSummary.hanging.quantity ? ` × ${payload.orderSummary.hanging.quantity}` : ''}`,
    `• Ножка: ${payload.orderSummary.stand.label}`,
    `• Подрамник: ${payload.orderSummary.stretcher.label}`,
    `• Печать: ${payload.orderSummary.printRequirement.requiresPrint
      ? `${payload.orderSummary.printRequirement.printMaterialLabel || 'Да'}${payload.orderSummary.printRequirement.transferSourceLabel ? `, источник: ${payload.orderSummary.printRequirement.transferSourceLabel}` : ''}`
      : 'Не требуется'}`,
    uploadedImage
      ? `• Файл клиента: ${uploadedImage.fileName} (${uploadedImage.sizeBytes ? `${Math.round(uploadedImage.sizeBytes / 1024)} КБ` : 'размер неизвестен'})`
      : '• Файл клиента: не загружен',
    '',
    'Материалы включены:',
    buildMaterialsText(payload.orderSummary),
    '',
    'Стоимость:',
    buildItemsText(payload.quote),
    `• Итого: ${formatMoney(payload.quote.total)}`,
    `• Предоплата обязательна: ${payload.prepayRequired ? 'Да' : 'Нет'}`,
    `• Сумма предоплаты: ${payload.prepayAmount ? formatMoney(payload.prepayAmount) : '—'}`,
  ].join('\n');
}

export async function notifyNewOrder(payload: NotifyNewOrderPayload): Promise<void> {
  const text = buildNotificationText(payload);
  const env = getServerEnv();
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  await Promise.all([
    sendTelegramLead(text).catch((error) => {
      logger.error('orders.notifications.telegram_send_failed', { error, orderNumber: payload.orderNumber });
    }),
    sendEmailLead({
      subject: `Новый заказ багета: ${payload.orderNumber}`,
      html: buildEmailHtmlFromText(text),
    }).catch((error) => {
      logger.error('orders.notifications.email_send_failed', { error, orderNumber: payload.orderNumber });
    }),
  ]);

  if (payload.customerImageFile && token && chatId) {
    const bytes = Buffer.from(await payload.customerImageFile.arrayBuffer());

    await sendTelegramDocumentBuffer({
      token,
      chatId,
      bytes,
      mime: payload.customerImageFile.type || 'application/octet-stream',
      filename: payload.customerImageFile.name || 'customer-upload.bin',
      caption: `Исходник клиента к заказу ${payload.orderNumber}`,
    }).catch((error) => {
      logger.error('orders.notifications.telegram_document_failed', {
        error,
        orderNumber: payload.orderNumber,
        filename: payload.customerImageFile?.name,
      });
    });
  }
}

import { sendSmtpEmail } from '@/lib/notifications/email';

function formatMoneyRub(amount: number | null | undefined): string {
  return `${Math.round(Number(amount ?? 0)).toLocaleString('ru-RU')} ₽`;
}

function formatValue(value: string | null | undefined): string {
  const text = (value ?? '').trim();
  return text || 'клиент';
}

export async function sendCustomerOrderEmail(params: {
  toEmail: string;
  customerName?: string | null;
  orderNumber: string;
  total: number;
  prepayRequired: boolean;
  prepayAmount?: number | null;
  pdfUrl: string;
}): Promise<void> {
  const greetingName = formatValue(params.customerName);

  const lines = [
    `Здравствуйте, ${greetingName}!`,
    '',
    `Ваш заказ №${params.orderNumber} принят в работу.`,
    `Сумма заказа: ${formatMoneyRub(params.total)}.`,
    params.prepayRequired
      ? `Предоплата (50%): ${formatMoneyRub(params.prepayAmount)}. Мы уточним удобный способ оплаты.`
      : 'Предоплата не требуется. Детали оплаты согласуем при подтверждении.',
    '',
    `PDF-документ заказа: ${params.pdfUrl}`,
    '',
    'Если у вас есть вопросы, ответьте на это письмо или свяжитесь с нами по телефону на сайте.',
  ];

  await sendSmtpEmail({
    to: params.toEmail,
    subject: `Your order #${params.orderNumber} received`,
    text: lines.join('\n'),
  });
}

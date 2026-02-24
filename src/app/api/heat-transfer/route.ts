import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { logger } from '@/lib/logger';
import { getServerEnv } from '@/lib/env';
export const runtime = 'nodejs';

type HeatTransferPayload = {
  productType: 'mug' | 'tshirt' | 'film';
  configuration: {
    mugType: 'white330' | 'chameleon';
    mugPrintType: 'single' | 'wrap';
    mugQuantity: number;
    tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    tshirtGender: 'male' | 'female';
    useOwnClothes: boolean;
    tshirtQuantity: number;
    filmLength: number;
    filmUrgent: boolean;
    filmTransfer: boolean;
  };
  pricing: {
    quantity: number;
    subtotal: number;
    discount: number;
    total: number;
    details: string[];
  };
  files: string[];
  contact: {
    name: string;
    phone: string;
    email?: string;
    comment?: string;
    agreed: boolean;
  };
};

function productLabel(type: HeatTransferPayload['productType']) {
  if (type === 'mug') return 'Кружка';
  if (type === 'tshirt') return 'Футболка';
  return 'Термоплёнка';
}

async function sendTelegramMessage(payload: HeatTransferPayload) {
  const env = getServerEnv();
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return false;

  const filesList = payload.files.length ? payload.files.join(', ') : 'Без файлов';
  const details = payload.pricing.details.length ? payload.pricing.details.join('; ') : '—';

  const text = [
    '🆕 Новая заявка — Термоперенос',
    '',
    `Имя: ${payload.contact.name}`,
    `Телефон: ${payload.contact.phone}`,
    `Email: ${payload.contact.email || '—'}`,
    `Тип: ${productLabel(payload.productType)}`,
    `Параметры: ${details}`,
    `Тираж: ${payload.pricing.quantity || '—'}`,
    `Скидка: ${payload.pricing.discount} ₽`,
    `Итого: ${payload.pricing.total} ₽`,
    `Файлы: ${filesList}`,
    `Комментарий: ${payload.contact.comment || '—'}`,
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  return response.ok;
}

async function sendEmail(payload: HeatTransferPayload) {
  const env = getServerEnv();
  const host = env.SMTP_HOST;
  const port = Number(env.SMTP_PORT || 0);
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  const to = env.MAIL_TO;

  if (!host || !port || !user || !pass || !to) return false;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const filesList = payload.files.length ? payload.files.join(', ') : 'Без файлов';
  const details = payload.pricing.details.length ? payload.pricing.details.join('; ') : '—';

  await transporter.sendMail({
    from: user,
    to,
    subject: 'Новая заявка — Термоперенос',
    text: [
      'Новая заявка — Термоперенос',
      '',
      `Имя: ${payload.contact.name}`,
      `Телефон: ${payload.contact.phone}`,
      `Email: ${payload.contact.email || '—'}`,
      `Тип: ${productLabel(payload.productType)}`,
      `Параметры: ${details}`,
      `Тираж: ${payload.pricing.quantity || '—'}`,
      `Скидка: ${payload.pricing.discount} ₽`,
      `Итого: ${payload.pricing.total} ₽`,
      `Файлы: ${filesList}`,
      `Комментарий: ${payload.contact.comment || '—'}`,
    ].join('\n'),
  });

  return true;
}

export async function POST(req: NextRequest) {
  try {
    getServerEnv();
    const payload = (await req.json()) as HeatTransferPayload;

    if (!payload?.contact?.name || !payload?.contact?.phone || !payload?.contact?.agreed) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    const phone = String(payload.contact.phone).replace(/[\s()-]/g, '');
    if (!/^(\+7\d{10}|8\d{10})$/.test(phone)) {
      return NextResponse.json({ ok: false, error: 'Неверный формат телефона.' }, { status: 400 });
    }

    payload.contact.phone = phone;

    const [emailSent, telegramSent] = await Promise.all([
      sendEmail(payload).catch(() => false),
      sendTelegramMessage(payload).catch(() => false),
    ]);

    if (!emailSent && !telegramSent) {
      return NextResponse.json(
        { ok: false, error: 'Не удалось отправить уведомление. Проверьте настройки SMTP/Telegram.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

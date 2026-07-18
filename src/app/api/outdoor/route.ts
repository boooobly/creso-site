import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';

import { logger } from '@/lib/logger';
import { getServerEnv } from '@/lib/env';
import { createServiceRequestOrder } from '@/lib/orders/createServiceRequestOrder';
import { idempotencyErrorResponse, readRequestIdempotency } from '@/lib/orders/idempotency';
export const runtime = 'nodejs';

type OutdoorPayload = {
  orderNumber?: string;
  address: string;
  dimensions: string;
  budget?: string;
  phone: string;
  agreed: boolean;
};

function buildMessage(payload: OutdoorPayload) {
  return [
    'Новая заявка — Наружная реклама',
    payload.orderNumber ? `Номер заявки: #${payload.orderNumber}` : '',
    '',
    `Адрес: ${payload.address}`,
    `Размеры: ${payload.dimensions}`,
    `Бюджет: ${payload.budget?.trim() || '—'}`,
    `Телефон: ${payload.phone}`,
  ].join('\n');
}

async function sendTelegramMessage(text: string) {
  const env = getServerEnv();
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return false;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  return response.ok;
}

async function sendEmail(text: string) {
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

  await transporter.sendMail({
    from: user,
    to,
    subject: 'Новая заявка — Наружная реклама',
    text,
  });

  return true;
}

export async function POST(req: NextRequest) {
  try {
    getServerEnv();
    const payload = (await req.json()) as OutdoorPayload;

    const blockedResponse = enforcePublicRequestGuard(req, {
      route: '/api/outdoor',
      payload,
      honeypotFields: ['website'],
      requirePayload: true,
    });

    if (blockedResponse) {
      return blockedResponse;
    }

    if (!payload?.address || !payload?.dimensions || !payload?.phone || !payload?.agreed) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    const phone = String(payload.phone).replace(/[^\d+]/g, '');
    if (!/^(\+7\d{10}|8\d{10})$/.test(phone)) {
      return NextResponse.json({ ok: false, error: 'Неверный формат телефона.' }, { status: 400 });
    }

    payload.phone = phone;

    const createdOrder = await createServiceRequestOrder({
      source: 'outdoor',
      customer: { phone },
      total: 0,
      payloadJson: { service: 'outdoor', ...payload, phone, referer: req.headers.get('referer') || req.headers.get('origin') || '' },
      ...readRequestIdempotency(req.headers, { ...payload, orderNumber: undefined, phone }),
    });
    payload.orderNumber = createdOrder.orderNumber;

    const message = buildMessage(payload);

    const [emailSent, telegramSent] = await Promise.all([
      sendEmail(message).catch(() => false),
      sendTelegramMessage(message).catch(() => false),
    ]);

    if (!emailSent && !telegramSent) {
      return NextResponse.json(
        { ok: false, error: 'Не удалось отправить уведомление. Проверьте настройки SMTP/Telegram.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const idempotencyResponse = idempotencyErrorResponse(error);
    if (idempotencyResponse) return idempotencyResponse;
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

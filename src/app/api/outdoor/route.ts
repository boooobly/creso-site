import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getClientIp, hasUserAgent, isEmptyPayload, isHoneypotTriggered, isRateLimited } from '@/lib/anti-spam';

export const runtime = 'nodejs';

type OutdoorPayload = {
  address: string;
  dimensions: string;
  budget?: string;
  phone: string;
  agreed: boolean;
};

function buildMessage(payload: OutdoorPayload) {
  return [
    'Новая заявка — Наружная реклама',
    '',
    `Адрес: ${payload.address}`,
    `Размеры: ${payload.dimensions}`,
    `Бюджет: ${payload.budget?.trim() || '—'}`,
    `Телефон: ${payload.phone}`,
  ].join('\n');
}

async function sendTelegramMessage(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return false;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  return response.ok;
}

async function sendEmail(text: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.MAIL_TO;

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
    const payload = (await req.json()) as OutdoorPayload;

    if (!hasUserAgent(req)) {
      return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 400 });
    }

    if (isRateLimited(getClientIp(req))) {
      return NextResponse.json({ ok: false, error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 });
    }

    if (isEmptyPayload(payload)) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    if (isHoneypotTriggered(payload, 'website')) {
      return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 400 });
    }

    if (!payload?.address || !payload?.dimensions || !payload?.phone || !payload?.agreed) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    const phone = String(payload.phone).replace(/[^\d+]/g, '');
    if (!/^(\+7\d{10}|8\d{10})$/.test(phone)) {
      return NextResponse.json({ ok: false, error: 'Неверный формат телефона.' }, { status: 400 });
    }

    payload.phone = phone;

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
  } catch {
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

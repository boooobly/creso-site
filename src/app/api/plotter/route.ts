import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { logger } from '@/lib/logger';
import { env } from '@/lib/env';
export const runtime = 'nodejs';

type PlotterPayload = {
  calculator: {
    material: string;
    cutLength: number;
    area: number;
    complexity: number;
    extras: {
      weeding: boolean;
      mountingFilm: boolean;
      transfer: boolean;
      urgent: boolean;
    };
    baseCost: number;
    extrasCost: number;
    minimumApplied: boolean;
    total: number;
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

function formatExtras(extras: PlotterPayload['calculator']['extras']) {
  const items: string[] = [];
  if (extras.weeding) items.push('Выборка');
  if (extras.mountingFilm) items.push('Монтажная плёнка');
  if (extras.transfer) items.push('Перенос на деталь');
  if (extras.urgent) items.push('Срочный заказ (+30%)');
  return items.length ? items.join(', ') : 'Нет';
}

async function sendTelegramMessage(payload: PlotterPayload) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return false;

  const extras = formatExtras(payload.calculator.extras);
  const filesList = payload.files.length ? payload.files.join(', ') : 'Без файлов';

  const text = [
    '🆕 Новая заявка — Плоттерная резка',
    '',
    `Имя: ${payload.contact.name}`,
    `Телефон: ${payload.contact.phone}`,
    `Email: ${payload.contact.email || '—'}`,
    `Материал: ${payload.calculator.material}`,
    `Длина: ${payload.calculator.cutLength} м`,
    `Площадь: ${payload.calculator.area} м²`,
    `Сложность: x${payload.calculator.complexity}`,
    `Доп услуги: ${extras}`,
    `Итого: ${payload.calculator.total} ₽`,
    `Файлы: ${filesList}`,
    `Комментарий: ${payload.contact.comment || '—'}`,
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  return response.ok;
}

async function sendEmail(payload: PlotterPayload) {
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

  const extras = formatExtras(payload.calculator.extras);
  const filesList = payload.files.length ? payload.files.join(', ') : 'Без файлов';

  await transporter.sendMail({
    from: user,
    to,
    subject: 'Новая заявка — Плоттерная резка',
    text: [
      'Новая заявка — Плоттерная резка',
      '',
      `Имя: ${payload.contact.name}`,
      `Телефон: ${payload.contact.phone}`,
      `Email: ${payload.contact.email || '—'}`,
      `Материал: ${payload.calculator.material}`,
      `Длина: ${payload.calculator.cutLength} м`,
      `Площадь: ${payload.calculator.area} м²`,
      `Сложность: x${payload.calculator.complexity}`,
      `Доп услуги: ${extras}`,
      `Итого: ${payload.calculator.total} ₽`,
      `Файлы: ${filesList}`,
      `Комментарий: ${payload.contact.comment || '—'}`,
    ].join('\n'),
  });

  return true;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as PlotterPayload;

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
      return NextResponse.json({ ok: false, error: 'Не удалось отправить уведомление. Проверьте настройки SMTP/Telegram.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getClientIp, hasUserAgent, isRateLimited } from '@/lib/anti-spam';
import { sendTelegramDocument } from '@/lib/notifications/telegram/sendDocumentWithCaption';

export const runtime = 'nodejs';

const MAX_TELEGRAM_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff']);

function toStringValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
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

async function sendEmail(text: string, file?: File) {
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

  let attachments: Array<{ filename: string; content: Buffer }> | undefined;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    attachments = [{ filename: file.name || 'upload.bin', content: Buffer.from(bytes) }];
  }

  await transporter.sendMail({
    from: user,
    to,
    subject: 'Новая заявка — Широкоформатная печать',
    text,
    attachments,
  });

  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!hasUserAgent(request)) {
      return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 400 });
    }

    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json({ ok: false, error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 });
    }

    const formData = await request.formData();
    const name = toStringValue(formData.get('name'));
    const phoneRaw = toStringValue(formData.get('phone')).replace(/\D/g, '');
    const email = toStringValue(formData.get('email'));
    const width = toStringValue(formData.get('width'));
    const height = toStringValue(formData.get('height'));
    const comment = toStringValue(formData.get('comment'));
    const website = toStringValue(formData.get('website'));
    const fileRaw = formData.get('file');

    if (website) {
      return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 400 });
    }

    if (!name || !phoneRaw) {
      return NextResponse.json({ ok: false, error: 'Заполните обязательные поля.' }, { status: 400 });
    }

    if (!/^(7\d{10}|8\d{10})$/.test(phoneRaw)) {
      return NextResponse.json({ ok: false, error: 'Неверный формат телефона.' }, { status: 400 });
    }

    const phone = phoneRaw.startsWith('8') ? `7${phoneRaw.slice(1)}` : phoneRaw;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Некорректный email.' }, { status: 400 });
    }

    const file = fileRaw instanceof File ? fileRaw : undefined;

    if (file && !ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ ok: false, error: 'Допустимы только изображения (JPG, PNG, WEBP, TIFF).' }, { status: 400 });
    }

    const message = [
      'Новая заявка — Широкоформатная печать',
      '',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Email: ${email || '—'}`,
      `Ширина (мм): ${width || '—'}`,
      `Высота (мм): ${height || '—'}`,
      `Комментарий: ${comment || '—'}`,
      `Файл: ${file?.name ? `${file.name} (${Math.round(file.size / 1024)} KB)` : '—'}`,
    ].join('\n');

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const telegramCanSendFile = Boolean(botToken && chatId && file && file.size <= MAX_TELEGRAM_FILE_SIZE_BYTES);
    const isFileTooLarge = Boolean(file && file.size > MAX_TELEGRAM_FILE_SIZE_BYTES);

    const telegramText = isFileTooLarge
      ? `${message}\n\n⚠️ File too large for bot upload (>50MB).`
      : message;

    const [emailSent, telegramSent] = await Promise.all([
      sendEmail(message, file).catch(() => false),
      sendTelegramMessage(telegramText).catch(() => false),
    ]);

    if (telegramCanSendFile) {
      await sendTelegramDocument({
        chatId: chatId!,
        token: botToken!,
        caption: 'Файл для заявки — широкоформатная печать',
        file,
      }).catch(() => null);
    }

    if (!emailSent && !telegramSent) {
      return NextResponse.json(
        { ok: false, error: 'Не удалось отправить уведомление. Проверьте настройки SMTP/Telegram.' },
        { status: 500 },
      );
    }

    if (isFileTooLarge) {
      return NextResponse.json({ ok: true, fileSent: false, reason: 'too_large' });
    }

    return NextResponse.json({ ok: true, fileSent: telegramCanSendFile ? true : undefined });
  } catch {
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

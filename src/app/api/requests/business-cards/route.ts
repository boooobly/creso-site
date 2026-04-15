import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';
import { logger } from '@/lib/logger';
import { FIVE_MB_IN_BYTES, validateUploadedFile } from '@/lib/file-validation';
import { getServerEnv } from '@/lib/env';
import { sendTelegramDocument } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import { multipartErrorResponse, validateMultipartContentLength, validateMultipartFiles } from '@/lib/upload-safety';

export const runtime = 'nodejs';

const MAX_TELEGRAM_FILE_SIZE_BYTES = FIVE_MB_IN_BYTES;
const MAX_CONTENT_LENGTH_BYTES = MAX_TELEGRAM_FILE_SIZE_BYTES + (512 * 1024);
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'application/pdf',
  'application/postscript',
  'application/vnd.adobe.photoshop',
  'application/illustrator',
]);
const ALLOWED_UPLOAD_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.pdf', '.cdr', '.ai', '.psd']);

function toStringValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function toBooleanValue(value: FormDataEntryValue | null): boolean {
  return toStringValue(value).toLowerCase() === 'true';
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

async function sendEmail(text: string, file?: File) {
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

  let attachments: Array<{ filename: string; content: Buffer }> | undefined;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    attachments = [{ filename: file.name || 'upload.bin', content: Buffer.from(bytes) }];
  }

  await transporter.sendMail({
    from: user,
    to,
    subject: 'Новая заявка — Визитки',
    text,
    attachments,
  });

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const env = getServerEnv();
    const contentLengthValidation = validateMultipartContentLength(request, {
      maxContentLengthBytes: MAX_CONTENT_LENGTH_BYTES,
    });
    if (!contentLengthValidation.ok) {
      return multipartErrorResponse(contentLengthValidation);
    }

    const formData = await request.formData();
    const name = toStringValue(formData.get('name'));
    const phoneRaw = toStringValue(formData.get('phone')).replace(/\D/g, '');
    const email = toStringValue(formData.get('email'));
    const comment = toStringValue(formData.get('comment'));
    const website = toStringValue(formData.get('website'));

    const product = toStringValue(formData.get('product'));
    const quantity = Number(toStringValue(formData.get('quantity')));
    const printSide = toStringValue(formData.get('printSide'));
    const lamination = toBooleanValue(formData.get('lamination'));
    const needDesign = toBooleanValue(formData.get('needDesign'));
    const unitPrice = Number(toStringValue(formData.get('unitPrice')));
    const totalPrice = Number(toStringValue(formData.get('totalPrice')));
    const turnaround = toStringValue(formData.get('turnaround'));
    const size = toStringValue(formData.get('size'));
    const stock = toStringValue(formData.get('stock'));
    const printType = toStringValue(formData.get('printType'));
    const notes = toStringValue(formData.get('notes'));
    const flyersRequested = toBooleanValue(formData.get('flyersRequested'));

    const fileName = toStringValue(formData.get('fileName'));
    const fileType = toStringValue(formData.get('fileType'));
    const fileSize = Number(toStringValue(formData.get('fileSize')) || '0');
    const fileRaw = formData.get('file');

    const blockedResponse = enforcePublicRequestGuard(request, {
      route: '/api/requests/business-cards',
      payload: {
        name,
        phone: phoneRaw,
        email,
        comment,
        website,
      },
      honeypotFields: ['website'],
      requirePayload: true,
    });

    if (blockedResponse) {
      return blockedResponse;
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

    if (!Number.isFinite(quantity) || quantity < 1000 || quantity > 9000 || quantity % 1000 !== 0) {
      return NextResponse.json({ ok: false, error: 'Некорректный тираж.' }, { status: 400 });
    }

    if (printSide !== 'single' && printSide !== 'double') {
      return NextResponse.json({ ok: false, error: 'Некорректный тип печати.' }, { status: 400 });
    }

    if (!Number.isFinite(unitPrice) || !Number.isFinite(totalPrice)) {
      return NextResponse.json({ ok: false, error: 'Некорректная стоимость.' }, { status: 400 });
    }

    const file = fileRaw instanceof File ? fileRaw : undefined;
    const filesValidation = validateMultipartFiles(file ? [file] : [], {
      maxFiles: 1,
      maxFileBytes: MAX_TELEGRAM_FILE_SIZE_BYTES,
      maxTotalBytes: MAX_TELEGRAM_FILE_SIZE_BYTES,
    });
    if (!filesValidation.ok) {
      return multipartErrorResponse(filesValidation);
    }

    if (file) {
      const fileValidation = validateUploadedFile({
        file,
        allowedMimeTypes: ALLOWED_UPLOAD_MIME_TYPES,
        allowedExtensions: ALLOWED_UPLOAD_EXTENSIONS,
        maxBytes: MAX_TELEGRAM_FILE_SIZE_BYTES,
      });

      if (!fileValidation.ok) {
        return NextResponse.json({ ok: false, error: fileValidation.error }, { status: 400 });
      }
    }

    const message = [
      'Визитки — новая заявка',
      '',
      `Продукт: ${product || 'Business cards'}`,
      `Тираж: ${quantity}`,
      `Печать: ${printSide === 'single' ? 'Односторонняя' : 'Двусторонняя'}`,
      `Ламинация: ${lamination ? 'Да' : 'Нет'}`,
      `Нужен дизайн: ${needDesign ? 'Да' : 'Нет'}`,
      `Цена за шт: ${unitPrice.toLocaleString('ru-RU')} ₽`,
      `Итого: ${Math.round(totalPrice).toLocaleString('ru-RU')} ₽`,
      `Срок: ${turnaround}`,
      `Размер: ${size}`,
      `Материал: ${stock}`,
      `Тип печати: ${printType}`,
      `Notes: ${notes || '—'}`,
      `Флаеры: ${flyersRequested ? 'нужен расчёт по согласованию с менеджером.' : 'не запрошены'}`,
      '',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Email: ${email || '—'}`,
      `Комментарий: ${comment || '—'}`,
      `Файл: ${file?.name ? `${file.name} (${Math.round(file.size / 1024)} KB)` : '—'}`,
      `fileName: ${fileName || '—'}`,
      `fileType: ${fileType || '—'}`,
      `fileSize: ${fileSize > 0 ? `${Math.round(fileSize / 1024)} KB` : '—'}`,
    ].join('\n');

    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;
    const telegramCanSendFile = Boolean(botToken && chatId && file && file.size <= MAX_TELEGRAM_FILE_SIZE_BYTES);
    const isFileTooLarge = Boolean(file && file.size > MAX_TELEGRAM_FILE_SIZE_BYTES);

    const telegramText = isFileTooLarge
      ? `${message}\n\n⚠️ File too large for bot upload (>5MB).`
      : message;

    const [emailSent, telegramSent] = await Promise.all([
      sendEmail(message, file).catch(() => false),
      sendTelegramMessage(telegramText).catch(() => false),
    ]);

    if (telegramCanSendFile && file instanceof File) {
      await sendTelegramDocument({
        chatId: chatId!,
        token: botToken!,
        caption: 'Файл заявки (визитки)',
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

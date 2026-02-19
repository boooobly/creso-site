import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getClientIp, hasUserAgent, isRateLimited } from '@/lib/anti-spam';
import { calculateWideFormatPricing } from '@/lib/calculations/wideFormatPricing';
import type { WideFormatMaterialType } from '@/lib/calculations/types';
import { sendTelegramDocument } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import { getWideFormatMaterialLabel, WIDE_FORMAT_MATERIAL_OPTIONS } from '@/lib/pricing-config/wideFormat';

export const runtime = 'nodejs';

const MAX_TELEGRAM_FILE_SIZE_BYTES = 50 * 1024 * 1024;
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

function formatRub(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function isWideFormatMaterialType(value: string): value is WideFormatMaterialType {
  return WIDE_FORMAT_MATERIAL_OPTIONS.some((option) => option.value === value);
}


function isAllowedUploadFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}` : '';
  return ALLOWED_UPLOAD_MIME_TYPES.has(mime) || ALLOWED_UPLOAD_EXTENSIONS.has(extension);
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
    const quantity = toStringValue(formData.get('quantity'));
    const materialIdRaw = toStringValue(formData.get('materialId'));
    const comment = toStringValue(formData.get('comment'));
    const website = toStringValue(formData.get('website'));
    const edgeGluing = toBooleanValue(formData.get('edgeGluing'));
    const imageWelding = toBooleanValue(formData.get('imageWelding'));
    const grommets = toBooleanValue(formData.get('grommets'));
    const plotterCutByRegistrationMarks = toBooleanValue(formData.get('plotterCutByRegistrationMarks'));
    const cutByPositioningMarks = toBooleanValue(formData.get('cutByPositioningMarks'));
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

    if (!isWideFormatMaterialType(materialIdRaw)) {
      return NextResponse.json({ ok: false, error: 'Некорректный материал.' }, { status: 400 });
    }

    const parsedWidthMm = Number(width);
    const parsedHeightMm = Number(height);
    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedWidthMm) || parsedWidthMm <= 0 || !Number.isFinite(parsedHeightMm) || parsedHeightMm <= 0 || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json({ ok: false, error: 'Проверьте размеры и количество.' }, { status: 400 });
    }

    const calculated = calculateWideFormatPricing({
      material: materialIdRaw,
      bannerDensity: 300,
      widthInput: String(parsedWidthMm / 1000),
      heightInput: String(parsedHeightMm / 1000),
      quantityInput: String(parsedQuantity),
      edgeGluing,
      imageWelding,
      grommets,
      plotterCutByRegistrationMarks,
      cutByPositioningMarks,
    });

    const materialLabel = getWideFormatMaterialLabel(materialIdRaw);

    const extras = [
      { enabled: edgeGluing, label: 'Проклейка края', cost: calculated.edgeGluingCost },
      { enabled: imageWelding, label: 'Сварка изображения', cost: calculated.imageWeldingCost },
      { enabled: grommets, label: `Люверсы: да, ${calculated.grommetsCount} шт`, cost: calculated.grommetsCost },
      { enabled: cutByPositioningMarks, label: 'Резка по меткам позиционирования (+30%)', cost: calculated.positioningMarksCutCost },
    ].filter((item) => item.enabled && item.cost > 0);

    const extrasText = extras.length > 0
      ? extras.map((item) => `• ${item.label}: ${formatRub(item.cost)}`).join('\n')
      : 'Доп. услуги: нет';

    const file = fileRaw instanceof File ? fileRaw : undefined;

    if (file && !isAllowedUploadFile(file)) {
      return NextResponse.json({ ok: false, error: 'Допустимые форматы: JPG, PNG, WEBP, TIFF, PDF, CDR, AI, PSD.' }, { status: 400 });
    }

    if (file && file.size > MAX_TELEGRAM_FILE_SIZE_BYTES) {
      return NextResponse.json({ ok: false, error: 'Размер файла не должен превышать 50 МБ.' }, { status: 400 });
    }

    const message = [
      'Широкоформатная печать — новая заявка',
      '',
      `Материал: ${materialLabel} (${materialIdRaw})`,
      `Размер: ${Math.round(parsedWidthMm)} × ${Math.round(parsedHeightMm)} мм (${calculated.width.toFixed(2)} × ${calculated.height.toFixed(2)} м)`,
      `Кол-во: ${Math.round(parsedQuantity)}`,
      '',
      'Доп. услуги:',
      extrasText,
      `Резка по меткам: ${plotterCutByRegistrationMarks ? 'да' : 'нет'}`,
      `Оценочно (минимум): ${formatRub(calculated.plotterCutEstimatedCost || 250)}`,
      'Финальная стоимость резки по меткам — после проверки и утверждения макета менеджером.',
      '',
      'Стоимость:',
      `Материал: ${formatRub(calculated.basePrintCost)}`,
      `Доп. услуги: ${formatRub(calculated.extrasCost)}`,
      `Итого: ${formatRub(calculated.totalCost)}`,
      '',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Email: ${email || '—'}`,
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

    if (telegramCanSendFile && file instanceof File) {
      const uploadedFile = file;
      await sendTelegramDocument({
        chatId: chatId!,
        token: botToken!,
        caption: 'Файл заявки (широкоформат)',
        file: uploadedFile,
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

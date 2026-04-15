import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';
import { calculateWideFormatPricing } from '@/lib/calculations/wideFormatPricing';
import type { WideFormatMaterialType } from '@/lib/calculations/types';
import { sendTelegramDocument } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import { getWideFormatMaterialLabel, WIDE_FORMAT_MATERIAL_OPTIONS } from '@/lib/pricing-config/wideFormat';
import { getWideFormatPricingConfig, isWideFormatMaterialVisibleInConstructor } from '@/lib/wide-format/wideFormatPricing';

import { logger } from '@/lib/logger';
import { FIVE_MB_IN_BYTES, validateUploadedFile } from '@/lib/file-validation';
import { getServerEnv } from '@/lib/env';
export const runtime = 'nodejs';

const MAX_TELEGRAM_FILE_SIZE_BYTES = FIVE_MB_IN_BYTES;
const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;
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
    subject: 'Новая заявка — Широкоформатная печать',
    text,
    attachments,
  });

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const env = getServerEnv();

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
    const pageUrl = toStringValue(formData.get('pageUrl'));
    const fileRaw = formData.get('file');

    const blockedResponse = enforcePublicRequestGuard(request, {
      route: '/api/wide-format-order',
      payload: {
        name,
        phone: phoneRaw,
        email,
        width,
        height,
        quantity,
        materialId: materialIdRaw,
        comment,
        pageUrl,
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

    if (!isWideFormatMaterialType(materialIdRaw)) {
      return NextResponse.json({ ok: false, error: 'Некорректный материал.' }, { status: 400 });
    }

    const parsedWidthMm = Number(width);
    const parsedHeightMm = Number(height);
    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedWidthMm) || parsedWidthMm <= 0 || !Number.isFinite(parsedHeightMm) || parsedHeightMm <= 0 || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json({ ok: false, error: 'Проверьте размеры и количество.' }, { status: 400 });
    }

    const pricing = await getWideFormatPricingConfig();

    if (!isWideFormatMaterialVisibleInConstructor(materialIdRaw, pricing.config)) {
      return NextResponse.json({ ok: false, error: 'Этот материал сейчас скрыт в конструкторе. Выберите другой материал.' }, { status: 400 });
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
    }, pricing.config);

    const materialLabel = getWideFormatMaterialLabel(materialIdRaw);

    const extras = [
      { enabled: edgeGluing, label: 'Проклейка края', cost: calculated.edgeGluingCost },
      { enabled: imageWelding, label: 'Сварка изображения', cost: calculated.imageWeldingCost },
      { enabled: grommets, label: `Люверсы: да, ${calculated.grommetsCount} шт`, cost: calculated.grommetsCost },
      { enabled: cutByPositioningMarks, label: 'Резка по меткам позиционирования (+30%)', cost: calculated.positioningMarksCutCost },
    ].filter((item) => item.enabled && item.cost > 0);

    const extrasText = extras.length > 0
      ? extras.map((item) => `• ${item.label}: ${formatRub(item.cost)}`).join('\n')
      : '• Нет';

    const file = fileRaw instanceof File ? fileRaw : undefined;

    if (file) {
      const fileValidation = validateUploadedFile({
        file,
        allowedMimeTypes: ALLOWED_UPLOAD_MIME_TYPES,
        allowedExtensions: ALLOWED_UPLOAD_EXTENSIONS,
        maxBytes: MAX_UPLOAD_SIZE_BYTES,
      });

      if (!fileValidation.ok) {
        return NextResponse.json({ ok: false, error: fileValidation.error }, { status: 400 });
      }
    }

    const message = [
      '🆕 Новая заявка — Широкоформатная печать',
      '',
      `Материал: ${materialLabel}`,
      `Размер: ${Math.round(parsedWidthMm)} × ${Math.round(parsedHeightMm)} мм (${calculated.width.toFixed(2)} × ${calculated.height.toFixed(2)} м)`,
      `Кол-во: ${Math.round(parsedQuantity)}`,
      '',
      'Доп. услуги:',
      extrasText,
      `Резка по меткам: ${plotterCutByRegistrationMarks ? 'да' : 'нет'}`,
      `Оценочно (минимум): ${formatRub(calculated.plotterCutEstimatedCost || pricing.config.plotterCutMinimumFee)}`,
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
      `Файл: ${file?.name ? `${file.name} (${Math.round(file.size / 1024)} КБ)` : '—'}`,
      `Страница: ${pageUrl || request.headers.get('referer') || request.headers.get('origin') || '—'}`,
    ].join('\n');

    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;
    const telegramCanSendFile = Boolean(botToken && chatId && file && file.size <= MAX_TELEGRAM_FILE_SIZE_BYTES);
    const isFileTooLarge = Boolean(file && file.size > MAX_TELEGRAM_FILE_SIZE_BYTES);

    const telegramText = isFileTooLarge
      ? `${message}\n\n⚠️ Файл превышает 5 МБ для отправки ботом в Telegram. Менеджер получит заявку без вложения.`
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

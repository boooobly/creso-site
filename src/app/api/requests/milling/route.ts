import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, hasUserAgent, isRateLimited } from '@/lib/anti-spam';
import { getServerEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';
import { sendTelegramDocumentBuffer } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import {
  MILLING_ALLOWED_EXTENSIONS,
  MILLING_ALLOWED_MIME_TYPES,
  MILLING_MATERIAL_OPTIONS,
  MILLING_MAX_UPLOAD_SIZE_MB,
  MILLING_THICKNESS_BY_MATERIAL,
} from '@/lib/pricing-config/milling';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';

export const runtime = 'nodejs';

const allowedExtensionsSet = new Set<string>(MILLING_ALLOWED_EXTENSIONS);
const allowedMimeTypesSet = new Set<string>(MILLING_ALLOWED_MIME_TYPES);

const millingRequestSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  material: z.string().trim().min(1),
  thickness: z.string().trim().min(1),
  comment: z.string().trim().optional(),
  helpWithPrep: z.boolean(),
  website: z.string().trim().optional(),
});

function toText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toBoolean(value: FormDataEntryValue | null): boolean {
  return toText(value).toLowerCase() === 'true';
}

function isAllowedFile(file: File): boolean {
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}` : '';
  const mime = file.type.toLowerCase();
  return allowedExtensionsSet.has(extension) || allowedMimeTypesSet.has(mime);
}

function formatFileSize(size: number): string {
  return `${(size / 1024 / 1024).toFixed(2)} МБ`;
}

function isKnownMaterial(value: string): boolean {
  return MILLING_MATERIAL_OPTIONS.some((option) => option.value === value);
}

function isKnownThicknessForMaterial(material: string, thickness: string): boolean {
  const options = MILLING_THICKNESS_BY_MATERIAL[material];
  return Array.isArray(options) && options.includes(thickness);
}

function isTelegramSizeError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('too big') || message.includes('file is too big') || message.includes('request entity too large') || message.includes('413');
}

function buildMillingText(params: {
  name: string;
  phone: string;
  material: string;
  thickness: string;
  helpWithPrep: boolean;
  comment?: string;
  file: File | null;
  referer: string;
  ip: string;
}): string {
  return [
    '🆕 Новая заявка — Фрезеровка листовых материалов',
    '',
    `Услуга: Фрезеровка`,
    `Имя: ${params.name}`,
    `Телефон: ${params.phone}`,
    `Материал: ${params.material}`,
    `Толщина: ${params.thickness}`,
    `Нужна помощь с подготовкой файла: ${params.helpWithPrep ? 'Да' : 'Нет'}`,
    `Комментарий: ${params.comment || '—'}`,
    `Файл: ${params.file ? params.file.name : 'не прикреплён'}`,
    `Размер файла: ${params.file ? formatFileSize(params.file.size) : '—'}`,
    `MIME: ${params.file?.type || '—'}`,
    `Страница: ${params.referer || '—'}`,
    `IP: ${params.ip}`,
  ].join('\n');
}

async function sendMillingTelegramNotification(params: {
  text: string;
  file: File | null;
  name: string;
  phone: string;
  material: string;
  thickness: string;
  helpWithPrep: boolean;
  comment?: string;
}): Promise<boolean> {
  const env = getServerEnv();
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.warn('milling.telegram.not_configured');
    return false;
  }

  if (!params.file) {
    try {
      await sendTelegramLead(params.text);
      return true;
    } catch (error) {
      logger.error('milling.telegram.message_failed', { error });
      return false;
    }
  }

  const caption = [
    'Услуга: Фрезеровка',
    `Имя: ${params.name}`,
    `Телефон: ${params.phone}`,
    `Материал: ${params.material}`,
    `Толщина: ${params.thickness}`,
    `Нужна помощь с подготовкой файла: ${params.helpWithPrep ? 'Да' : 'Нет'}`,
    `Комментарий: ${params.comment || '—'}`,
  ].join('\n');

  try {
    const bytes = Buffer.from(await params.file.arrayBuffer());
    await sendTelegramDocumentBuffer({
      chatId,
      token,
      caption,
      bytes,
      filename: params.file.name || 'upload.bin',
      contentType: params.file.type || 'application/octet-stream',
    });

    return true;
  } catch (error) {
    logger.error('milling.telegram.document_failed', { error });

    const sizeWarning = isTelegramSizeError(error)
      ? `\n⚠️ Telegram не принял файл из-за размера: ${params.file.name} (${formatFileSize(params.file.size)}).`
      : `\n⚠️ Telegram не принял файл: ${params.file.name} (${formatFileSize(params.file.size)}).`;

    try {
      await sendTelegramLead(`${params.text}${sizeWarning}`);
      return true;
    } catch (fallbackError) {
      logger.error('milling.telegram.fallback_text_failed', { fallbackError });
      return false;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    getServerEnv();
    if (!hasUserAgent(request)) {
      return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 400 });
    }

    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json({ ok: false, error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 });
    }

    const formData = await request.formData();
    const fileValue = formData.get('file');

    const parsed = millingRequestSchema.safeParse({
      name: toText(formData.get('name')),
      phone: toText(formData.get('phone')),
      material: toText(formData.get('material')),
      thickness: toText(formData.get('thickness')),
      comment: toText(formData.get('comment')),
      helpWithPrep: toBoolean(formData.get('helpWithPrep')),
      website: toText(formData.get('website')),
    });

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Проверьте заполнение обязательных полей.' }, { status: 400 });
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const file = fileValue instanceof File ? fileValue : null;

    if (file && !isAllowedFile(file)) {
      return NextResponse.json({ ok: false, error: 'Разрешены только PDF, CDR, AI, EPS, DXF, SVG.' }, { status: 400 });
    }

    if (file && (file.size <= 0 || file.size > MILLING_MAX_UPLOAD_SIZE_MB * 1024 * 1024)) {
      return NextResponse.json({ ok: false, error: `Размер файла должен быть от 1 байта до ${MILLING_MAX_UPLOAD_SIZE_MB} МБ.` }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(parsed.data.phone);
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    }

    if (!isKnownMaterial(parsed.data.material)) {
      return NextResponse.json({ ok: false, error: 'Выбран некорректный материал.' }, { status: 400 });
    }

    if (!isKnownThicknessForMaterial(parsed.data.material, parsed.data.thickness)) {
      return NextResponse.json({ ok: false, error: 'Выбрана некорректная толщина для материала.' }, { status: 400 });
    }

    const text = buildMillingText({
      name: parsed.data.name,
      phone: normalizedPhone,
      material: parsed.data.material,
      thickness: parsed.data.thickness,
      helpWithPrep: parsed.data.helpWithPrep,
      comment: parsed.data.comment,
      file,
      referer: request.headers.get('referer') || request.headers.get('origin') || '',
      ip: getClientIp(request),
    });

    const [telegramSent, emailSent] = await Promise.all([
      sendMillingTelegramNotification({
        text,
        file,
        name: parsed.data.name,
        phone: normalizedPhone,
        material: parsed.data.material,
        thickness: parsed.data.thickness,
        helpWithPrep: parsed.data.helpWithPrep,
        comment: parsed.data.comment,
      }),
      sendEmailLead({
        subject: 'Новая заявка — Фрезеровка листовых материалов',
        html: buildEmailHtmlFromText(text),
      })
        .then(() => true)
        .catch((error) => {
          logger.error('milling.email.failed', { error });
          return false;
        }),
    ]);

    if (!telegramSent && !emailSent) {
      return NextResponse.json({ ok: false, error: 'Не удалось отправить уведомления в Telegram и Email.' }, { status: 502 });
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

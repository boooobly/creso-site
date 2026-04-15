import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';
import { getServerEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { FIVE_MB_IN_BYTES, validateDataUrlFile, validateUploadedFile } from '@/lib/file-validation';
import { EmailAttachment, sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';
import { sendTelegramDocumentBuffer } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';
import {
  MUGS_ALLOWED_EXTENSIONS,
  MUGS_ALLOWED_MIME_TYPES,
  MUGS_COVERING_OPTIONS,
} from '@/lib/pricing-config/mugs';
import { multipartErrorResponse, validateMultipartContentLength, validateMultipartFiles } from '@/lib/upload-safety';

export const runtime = 'nodejs';

const allowedExtensionsSet = new Set<string>(MUGS_ALLOWED_EXTENSIONS);
const allowedMimeTypesSet = new Set<string>(MUGS_ALLOWED_MIME_TYPES);
const MUGS_MAX_CONTENT_LENGTH_BYTES = FIVE_MB_IN_BYTES + (1024 * 1024);

const mugsRequestSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1),
  covering: z.string().trim().min(1),
  consent: z.boolean(),
  comment: z.string().trim().optional(),
  website: z.string().trim().optional(),
  rawImageDataUrl: z.string().optional().nullable(),
});

function toText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toBoolean(value: FormDataEntryValue | null): boolean {
  if (typeof value !== 'string') return false;
  return value.trim().toLowerCase() === 'true';
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mime: string } | null {
  const validation = validateDataUrlFile({
    dataUrl,
    allowedMimeTypes: allowedMimeTypesSet,
    maxBytes: FIVE_MB_IN_BYTES,
  });

  if (!validation.ok) return null;

  try {
    const buffer = Buffer.from(validation.base64, 'base64');
    if (!buffer.length) return null;
    return { buffer, mime: validation.mime };
  } catch {
    return null;
  }
}

function isKnownCovering(value: string): boolean {
  return MUGS_COVERING_OPTIONS.some((option) => option.value === value);
}

function getCoveringLabel(value: string): string {
  return MUGS_COVERING_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function buildMugsText(params: {
  name: string;
  phone: string;
  quantity: number;
  coveringLabel: string;
  consent: boolean;
  comment?: string;
  needsDesign: boolean;
  rawAttached: boolean;
}): string {
  return [
    'Услуга: Печать на кружках',
    `Имя: ${params.name || '—'}`,
    `Телефон: ${params.phone || '—'}`,
    `Количество: ${params.quantity || 1}`,
    `Покрытие: ${params.coveringLabel || '—'}`,
    `Комментарий: ${params.comment || '—'}`,
    `Согласие на обработку данных: ${params.consent ? 'да' : 'нет'}`,
    `Дизайн макета: ${params.needsDesign ? 'нужен' : 'не нужен'}`,
    `Исходник клиента: ${params.rawAttached ? 'прикреплен' : 'не прикреплен'}`,
  ].join('\n');
}

function extensionFromMime(mime?: string | null): string {
  if (!mime) return '.png';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  return '.png';
}

async function sendMugsTelegramNotification(params: {
  text: string;
  file: File | null;
  rawImageDataUrl: string | null;
}): Promise<boolean> {
  const env = getServerEnv();
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.warn('mugs.telegram.not_configured');
    return false;
  }

  const rawImageFromDataUrl = params.rawImageDataUrl ? dataUrlToBuffer(params.rawImageDataUrl) : null;

  const rawFileBuffer = params.file ? Buffer.from(await params.file.arrayBuffer()) : null;
  const rawFileMime = params.file?.type || null;

  try {
    await sendTelegramLead(params.text);

    if (rawImageFromDataUrl || rawFileBuffer) {
      const rawBuffer = rawImageFromDataUrl?.buffer ?? rawFileBuffer;
      const rawMime = rawImageFromDataUrl?.mime ?? rawFileMime ?? 'application/octet-stream';
      const ext = extensionFromMime(rawMime);
      await sendTelegramDocumentBuffer({
        chatId,
        token,
        caption: 'Исходник клиента (без сжатия)',
        bytes: rawBuffer as Buffer,
        filename: `original-client-upload${ext}`,
        contentType: rawMime,
      });
    }

    return true;
  } catch (error) {
    logger.error('mugs.telegram.failed', { error });
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    getServerEnv();
    const contentLengthValidation = validateMultipartContentLength(request, {
      maxContentLengthBytes: MUGS_MAX_CONTENT_LENGTH_BYTES,
    });
    if (!contentLengthValidation.ok) {
      return multipartErrorResponse(contentLengthValidation);
    }

    const formData = await request.formData();
    const fileValue = formData.get('file');
    const rawImageDataUrl = toText(formData.get('rawImageDataUrl')) || null;

    const blockedResponse = enforcePublicRequestGuard(request, {
      route: '/api/requests/mugs',
      payload: {
        name: toText(formData.get('name')),
        phone: toText(formData.get('phone')),
        quantity: toText(formData.get('quantity')),
        covering: toText(formData.get('covering')),
        consent: toText(formData.get('consent')),
        comment: toText(formData.get('comment')),
        website: toText(formData.get('website')),
      },
      requirePayload: true,
    });

    if (blockedResponse) {
      return blockedResponse;
    }


    const needsDesign = toBoolean(formData.get('needsDesign'));

    const parsed = mugsRequestSchema.safeParse({
      name: toText(formData.get('name')),
      phone: toText(formData.get('phone')),
      quantity: toText(formData.get('quantity')),
      covering: toText(formData.get('covering')),
      consent: toBoolean(formData.get('consent')),
      comment: toText(formData.get('comment')),
      website: toText(formData.get('website')),
      rawImageDataUrl,
    });

    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Проверьте заполнение обязательных полей.' }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true });

    const file = fileValue instanceof File ? fileValue : null;
    const filesValidation = validateMultipartFiles(file ? [file] : [], {
      maxFiles: 1,
      maxFileBytes: FIVE_MB_IN_BYTES,
      maxTotalBytes: FIVE_MB_IN_BYTES,
    });
    if (!filesValidation.ok) {
      return multipartErrorResponse(filesValidation);
    }

    if (file) {
      const fileValidation = validateUploadedFile({
        file,
        allowedMimeTypes: allowedMimeTypesSet,
        allowedExtensions: allowedExtensionsSet,
        maxBytes: FIVE_MB_IN_BYTES,
      });

      if (!fileValidation.ok) return NextResponse.json({ ok: false, error: fileValidation.error }, { status: 400 });
    }

    if (rawImageDataUrl) {
      const rawDataUrlValidation = validateDataUrlFile({
        dataUrl: rawImageDataUrl,
        allowedMimeTypes: allowedMimeTypesSet,
        maxBytes: FIVE_MB_IN_BYTES,
      });

      if (!rawDataUrlValidation.ok) return NextResponse.json({ ok: false, error: rawDataUrlValidation.error }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(parsed.data.phone);
    if (!normalizedPhone) return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    if (!isKnownCovering(parsed.data.covering)) return NextResponse.json({ ok: false, error: 'Выберите корректное покрытие.' }, { status: 400 });
    if (!parsed.data.consent) return NextResponse.json({ ok: false, error: 'Необходимо согласие на обработку персональных данных.' }, { status: 400 });

    const coveringLabel = getCoveringLabel(parsed.data.covering);

    const text = buildMugsText({
      name: parsed.data.name,
      phone: normalizedPhone,
      quantity: parsed.data.quantity,
      coveringLabel,
      consent: parsed.data.consent,
      comment: parsed.data.comment,
      needsDesign,
      rawAttached: Boolean(rawImageDataUrl || file),
    });

    const attachments: EmailAttachment[] = [];
    if (file) attachments.push({ filename: file.name, content: Buffer.from(await file.arrayBuffer()), contentType: file.type || 'application/octet-stream' });

    const [telegramSent, emailSent] = await Promise.all([
      sendMugsTelegramNotification({ text, file, rawImageDataUrl }),
      sendEmailLead({ subject: 'Новая заявка — Печать на кружках', html: buildEmailHtmlFromText(text), attachments })
        .then(() => true)
        .catch((error) => {
          logger.error('mugs.email.failed', { error });
          return false;
        }),
    ]);

    if (!telegramSent && !emailSent) return NextResponse.json({ ok: false, error: 'Не удалось отправить уведомления в Telegram и Email.' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    logger.error('mugs.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

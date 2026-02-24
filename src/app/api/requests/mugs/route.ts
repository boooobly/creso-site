import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, hasUserAgent, isRateLimited } from '@/lib/anti-spam';
import { getServerEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { FIVE_MB_IN_BYTES, validateDataUrlFile, validateUploadedFile } from '@/lib/file-validation';
import { EmailAttachment, sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead, sendTelegramPhotoAlbumBuffer, sendTelegramPhotoBuffer } from '@/lib/notifications/telegram';
import { sendTelegramDocumentBuffer } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';
import {
  MUGS_ALLOWED_EXTENSIONS,
  MUGS_ALLOWED_MIME_TYPES,
  MUGS_COVERING_OPTIONS,
} from '@/lib/pricing-config/mugs';

export const runtime = 'nodejs';

const allowedExtensionsSet = new Set<string>(MUGS_ALLOWED_EXTENSIONS);
const allowedMimeTypesSet = new Set<string>(MUGS_ALLOWED_MIME_TYPES);

const mugsRequestSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1),
  covering: z.string().trim().min(1),
  comment: z.string().trim().optional(),
  website: z.string().trim().optional(),
  rawImageDataUrl: z.string().optional().nullable(),
  mockPngDataUrl: z.string().optional().nullable(),
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
  comment?: string;
  needsDesign: boolean;
  rawAttached: boolean;
  mockAttached: boolean;
}): string {
  return [
    'Услуга: Печать на кружках',
    `Имя: ${params.name || '—'}`,
    `Телефон: ${params.phone || '—'}`,
    `Количество: ${params.quantity || 1}`,
    `Покрытие: ${params.coveringLabel || '—'}`,
    `Комментарий: ${params.comment || '—'}`,
    `Дизайн макета: ${params.needsDesign ? 'нужен' : 'не нужен'}`,
    `Исходник клиента: ${params.rawAttached ? 'прикреплен' : 'не прикреплен'}`,
    `Макет на кружке: ${params.mockAttached ? 'прикреплен' : 'не прикреплен'}`,
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
  mockPreview: File | null;
  printPreview: File | null;
  layout: File | null;
  rawImageDataUrl: string | null;
  mockPngDataUrl: string | null;
  name: string;
  phone: string;
  quantity: number;
  coveringLabel: string;
  comment?: string;
  needsDesign: boolean;
}): Promise<boolean> {
  const env = getServerEnv();
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.warn('mugs.telegram.not_configured');
    return false;
  }

  const mockImageFromDataUrl = params.mockPngDataUrl ? dataUrlToBuffer(params.mockPngDataUrl) : null;
  const rawImageFromDataUrl = params.rawImageDataUrl ? dataUrlToBuffer(params.rawImageDataUrl) : null;

  const rawFileBuffer = params.file ? Buffer.from(await params.file.arrayBuffer()) : null;
  const rawFileMime = params.file?.type || null;
  const hasRaw = Boolean(rawImageFromDataUrl || rawFileBuffer);
  const hasMock = Boolean(mockImageFromDataUrl);

  const caption = buildMugsText({
    name: params.name,
    phone: params.phone,
    quantity: params.quantity,
    coveringLabel: params.coveringLabel,
    comment: params.comment,
    needsDesign: params.needsDesign,
    rawAttached: hasRaw,
    mockAttached: hasMock,
  });

  try {
    if (mockImageFromDataUrl) {
      await sendTelegramPhotoBuffer({
        chatId,
        token,
        bytes: mockImageFromDataUrl.buffer,
        mime: mockImageFromDataUrl.mime,
        caption,
        filename: 'mug-mock-preview.png',
      });
    } else {
      await sendTelegramLead(caption);
    }

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
    if (!hasUserAgent(request)) return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 400 });
    if (isRateLimited(getClientIp(request))) return NextResponse.json({ ok: false, error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 });

    const formData = await request.formData();
    const fileValue = formData.get('file');
    const mockPreviewValue = formData.get('mockPreview');
    const printPreviewValue = formData.get('printPreview') ?? formData.get('preview');
    const layoutValue = formData.get('layout');
    const rawImageDataUrl = toText(formData.get('rawImageDataUrl')) || null;
    const mockPngDataUrl = toText(formData.get('mockPngDataUrl')) || null;

    const needsDesign = toBoolean(formData.get('needsDesign'));

    const parsed = mugsRequestSchema.safeParse({
      name: toText(formData.get('name')),
      phone: toText(formData.get('phone')),
      quantity: toText(formData.get('quantity')),
      covering: toText(formData.get('covering')),
      comment: toText(formData.get('comment')),
      website: toText(formData.get('website')),
      rawImageDataUrl,
      mockPngDataUrl,
    });

    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Проверьте заполнение обязательных полей.' }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true });

    const file = fileValue instanceof File ? fileValue : null;
    const mockPreview = mockPreviewValue instanceof File ? mockPreviewValue : null;
    const printPreview = printPreviewValue instanceof File ? printPreviewValue : null;
    const layout = layoutValue instanceof File ? layoutValue : null;

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

    if (mockPngDataUrl) {
      const mockDataUrlValidation = validateDataUrlFile({
        dataUrl: mockPngDataUrl,
        allowedMimeTypes: new Set(['image/png']),
        maxBytes: FIVE_MB_IN_BYTES,
      });

      if (!mockDataUrlValidation.ok) return NextResponse.json({ ok: false, error: mockDataUrlValidation.error }, { status: 400 });
    }

    const previews = [mockPreview, printPreview];
    for (const preview of previews) {
      if (!preview) continue;
      if (preview.type !== 'image/png') return NextResponse.json({ ok: false, error: 'Файлы превью должны быть PNG.' }, { status: 400 });
      if (preview.size <= 0 || preview.size > FIVE_MB_IN_BYTES) return NextResponse.json({ ok: false, error: 'File too large' }, { status: 400 });
    }

    if (layout) {
      if (layout.type !== 'application/json') return NextResponse.json({ ok: false, error: 'Layout должен быть в формате JSON.' }, { status: 400 });
      if (layout.size <= 0 || layout.size > FIVE_MB_IN_BYTES) return NextResponse.json({ ok: false, error: 'File too large' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(parsed.data.phone);
    if (!normalizedPhone) return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    if (!isKnownCovering(parsed.data.covering)) return NextResponse.json({ ok: false, error: 'Выберите корректное покрытие.' }, { status: 400 });

    const coveringLabel = getCoveringLabel(parsed.data.covering);

    const text = buildMugsText({
      name: parsed.data.name,
      phone: normalizedPhone,
      quantity: parsed.data.quantity,
      coveringLabel,
      comment: parsed.data.comment,
      needsDesign,
      rawAttached: Boolean(rawImageDataUrl || file),
      mockAttached: Boolean(mockPngDataUrl),
    });

    const attachments: EmailAttachment[] = [];
    if (file) attachments.push({ filename: file.name, content: Buffer.from(await file.arrayBuffer()), contentType: file.type || 'application/octet-stream' });
    if (mockPreview) attachments.push({ filename: mockPreview.name || 'mug-mock-preview.png', content: Buffer.from(await mockPreview.arrayBuffer()), contentType: 'image/png' });
    if (printPreview) attachments.push({ filename: printPreview.name || 'mug-print-preview.png', content: Buffer.from(await printPreview.arrayBuffer()), contentType: 'image/png' });
    if (layout) attachments.push({ filename: layout.name || 'mug-layout.json', content: Buffer.from(await layout.arrayBuffer()), contentType: 'application/json' });

    const [telegramSent, emailSent] = await Promise.all([
      sendMugsTelegramNotification({ text, file, mockPreview, printPreview, layout, rawImageDataUrl, mockPngDataUrl, name: parsed.data.name, phone: normalizedPhone, quantity: parsed.data.quantity, coveringLabel, comment: parsed.data.comment, needsDesign }),
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

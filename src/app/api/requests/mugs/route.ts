import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, hasUserAgent, isRateLimited } from '@/lib/anti-spam';
import { getServerEnv } from '@/lib/env';
import { LAYOUT_MAX_SIZE_KB, PREVIEW_MAX_SIZE_MB } from '@/lib/mugDesigner/constants';
import { logger } from '@/lib/logger';
import { EmailAttachment, sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead, sendTelegramPhotoAlbumBuffer, sendTelegramPhotoBuffer } from '@/lib/notifications/telegram';
import { sendTelegramDocumentBuffer } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';
import {
  MUGS_ALLOWED_EXTENSIONS,
  MUGS_ALLOWED_MIME_TYPES,
  MUGS_COVERING_OPTIONS,
  MUGS_MAX_UPLOAD_SIZE_MB,
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
  try {
    const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
    if (!match) return null;
    const mime = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length) return null;
    return { buffer, mime };
  } catch {
    return null;
  }
}

function isAllowedFile(file: File): boolean {
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}` : '';
  const mime = file.type.toLowerCase();
  return allowedExtensionsSet.has(extension) || allowedMimeTypesSet.has(mime);
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

    if (file && !isAllowedFile(file)) return NextResponse.json({ ok: false, error: 'Разрешены png, jpg, jpeg, webp, pdf, cdr, ai, eps, dxf, svg.' }, { status: 400 });
    if (file && (file.size <= 0 || file.size > MUGS_MAX_UPLOAD_SIZE_MB * 1024 * 1024)) return NextResponse.json({ ok: false, error: `Размер файла должен быть от 1 байта до ${MUGS_MAX_UPLOAD_SIZE_MB} МБ.` }, { status: 400 });

    const previews = [mockPreview, printPreview];
    for (const preview of previews) {
      if (!preview) continue;
      if (preview.type !== 'image/png') return NextResponse.json({ ok: false, error: 'Файлы превью должны быть PNG.' }, { status: 400 });
      if (preview.size <= 0 || preview.size > PREVIEW_MAX_SIZE_MB * 1024 * 1024) return NextResponse.json({ ok: false, error: `Размер превью должен быть от 1 байта до ${PREVIEW_MAX_SIZE_MB} МБ.` }, { status: 400 });
    }

    if (layout) {
      if (layout.type !== 'application/json') return NextResponse.json({ ok: false, error: 'Layout должен быть в формате JSON.' }, { status: 400 });
      if (layout.size <= 0 || layout.size > LAYOUT_MAX_SIZE_KB * 1024) return NextResponse.json({ ok: false, error: `Размер layout JSON должен быть от 1 байта до ${LAYOUT_MAX_SIZE_KB} КБ.` }, { status: 400 });
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

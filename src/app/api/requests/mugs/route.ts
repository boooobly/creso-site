import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';
import { getServerEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { FIVE_MB_IN_BYTES, sanitizeUploadFileName, validateDataUrlFile, validateUploadedFile, validateUploadedImageFile } from '@/lib/file-validation';
import { EmailAttachment, sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';
import { sendTelegramDocumentBuffer } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';
import { MUGS_ALLOWED_EXTENSIONS, MUGS_ALLOWED_MIME_TYPES, MUGS_COVERING_OPTIONS } from '@/lib/pricing-config/mugs';
import { multipartErrorResponse, validateMultipartContentLength, validateMultipartFiles } from '@/lib/upload-safety';

export const runtime = 'nodejs';
const allowedExtensionsSet = new Set<string>(MUGS_ALLOWED_EXTENSIONS);
const allowedMimeTypesSet = new Set<string>(MUGS_ALLOWED_MIME_TYPES);
const designerMimeTypes = new Set(['image/png', 'image/jpeg']);
const designerExtensions = new Set(['.png', '.jpg', '.jpeg']);
const DESIGN_EXPORT_MAX_BYTES = 10 * 1024 * 1024;
const DESIGN_JSON_MAX_CHARS = 256 * 1024;
const DESIGNER_FILES_MAX_COUNT = 8;
const DESIGNER_FILES_MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const MUGS_MAX_CONTENT_LENGTH_BYTES = 48 * 1024 * 1024;

const mugsRequestSchema = z.object({ name: z.string().trim().min(1), phone: z.string().trim().min(1), quantity: z.coerce.number().int().min(1), covering: z.string().trim().min(1), consent: z.boolean(), comment: z.string().trim().optional(), website: z.string().trim().optional(), rawImageDataUrl: z.string().optional().nullable(), mugDesignPreviewDataUrl: z.string().optional().nullable(), mugPrintLayoutDataUrl: z.string().optional().nullable(), mugDesignJson: z.string().max(DESIGN_JSON_MAX_CHARS).optional().nullable() });
function toText(value: FormDataEntryValue | null): string { return typeof value === 'string' ? value.trim() : ''; }
function toBoolean(value: FormDataEntryValue | null): boolean { return typeof value === 'string' && value.trim().toLowerCase() === 'true'; }
function parseDataUrl(dataUrl: string, allowedMimeTypes: ReadonlySet<string>, maxBytes: number) {
  const validation = validateDataUrlFile({ dataUrl, allowedMimeTypes, maxBytes });
  if (!validation.ok) return null;
  try { const buffer = Buffer.from(validation.base64, 'base64'); return buffer.length ? { buffer, mime: validation.mime } : null; } catch { return null; }
}
function hasSupportedImageSignature(file: { buffer: Buffer; mime: string }) {
  if (file.mime === 'image/png') return file.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (file.mime === 'image/jpeg') return file.buffer.length >= 3 && file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
  return false;
}
function isKnownCovering(value: string) { return MUGS_COVERING_OPTIONS.some((option) => option.value === value); }
function getCoveringLabel(value: string) { return MUGS_COVERING_OPTIONS.find((option) => option.value === value)?.label ?? value; }
function buildMugsText(params: { name: string; phone: string; quantity: number; coveringLabel: string; consent: boolean; comment?: string; needsDesign: boolean; rawAttached: boolean; constructorAttached: boolean }) {
  return ['Услуга: Печать на кружках', `Имя: ${params.name || '—'}`, `Телефон: ${params.phone || '—'}`, `Количество: ${params.quantity || 1}`, `Покрытие: ${params.coveringLabel || '—'}`, `Комментарий: ${params.comment || '—'}`, `Согласие на обработку данных: ${params.consent ? 'да' : 'нет'}`, `Дизайн макета: ${params.needsDesign ? 'нужен' : 'не нужен'}`, `Исходник клиента: ${params.rawAttached ? 'прикреплен' : 'не прикреплен'}`, `Макет из конструктора: ${params.constructorAttached ? 'да' : 'нет'}`].join('\n');
}
function extensionFromMime(mime?: string | null) { return mime === 'image/jpeg' ? '.jpg' : mime === 'image/png' ? '.png' : '.bin'; }
async function sendMugsTelegramNotification(params: { text: string; file: File | null; rawImageDataUrl: string | null; preview: ReturnType<typeof parseDataUrl>; printLayout: ReturnType<typeof parseDataUrl> }) {
  const env = getServerEnv(); const token = env.TELEGRAM_BOT_TOKEN; const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) { logger.warn('mugs.telegram.not_configured'); return false; }
  const rawFromDataUrl = params.rawImageDataUrl ? parseDataUrl(params.rawImageDataUrl, allowedMimeTypesSet, FIVE_MB_IN_BYTES) : null;
  const rawFileBuffer = params.file ? Buffer.from(await params.file.arrayBuffer()) : null;
  try {
    await sendTelegramLead(params.text);
    if (rawFromDataUrl || rawFileBuffer) await sendTelegramDocumentBuffer({ chatId, token, caption: 'Исходник клиента (без сжатия)', bytes: rawFromDataUrl?.buffer ?? rawFileBuffer as Buffer, filename: `original-client-upload${extensionFromMime(rawFromDataUrl?.mime ?? params.file?.type)}`, contentType: rawFromDataUrl?.mime ?? params.file?.type ?? 'application/octet-stream' });
    if (params.preview) await sendTelegramDocumentBuffer({ chatId, token, caption: 'Превью макета на кружке', bytes: params.preview.buffer, filename: 'mug-design-preview.png', contentType: params.preview.mime });
    if (params.printLayout) await sendTelegramDocumentBuffer({ chatId, token, caption: 'Печатная зона макета', bytes: params.printLayout.buffer, filename: 'mug-print-layout.png', contentType: params.printLayout.mime });
    return true;
  } catch (error) { logger.error('mugs.telegram.failed', { error }); return false; }
}

export async function POST(request: NextRequest) {
  try {
    getServerEnv();
    const contentLengthValidation = validateMultipartContentLength(request, { maxContentLengthBytes: MUGS_MAX_CONTENT_LENGTH_BYTES });
    if (!contentLengthValidation.ok) return multipartErrorResponse(contentLengthValidation);
    const formData = await request.formData();
    const fileValue = formData.get('file'); const file = fileValue instanceof File ? fileValue : null;
    const rawImageDataUrl = toText(formData.get('rawImageDataUrl')) || null;
    const mugDesignPreviewDataUrl = toText(formData.get('mugDesignPreviewDataUrl')) || null;
    const mugPrintLayoutDataUrl = toText(formData.get('mugPrintLayoutDataUrl')) || null;
    const mugDesignJson = toText(formData.get('mugDesignJson')) || null;
    const designerSourceFiles = formData.getAll('designerSourceFiles[]').filter((value): value is File => value instanceof File);
    const blockedResponse = enforcePublicRequestGuard(request, { route: '/api/requests/mugs', payload: { name: toText(formData.get('name')), phone: toText(formData.get('phone')), quantity: toText(formData.get('quantity')), covering: toText(formData.get('covering')), consent: toText(formData.get('consent')), comment: toText(formData.get('comment')), website: toText(formData.get('website')) }, requirePayload: true });
    if (blockedResponse) return blockedResponse;
    const needsDesign = toBoolean(formData.get('needsDesign'));
    const parsed = mugsRequestSchema.safeParse({ name: toText(formData.get('name')), phone: toText(formData.get('phone')), quantity: toText(formData.get('quantity')), covering: toText(formData.get('covering')), consent: toBoolean(formData.get('consent')), comment: toText(formData.get('comment')), website: toText(formData.get('website')), rawImageDataUrl, mugDesignPreviewDataUrl, mugPrintLayoutDataUrl, mugDesignJson });
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Проверьте заполнение обязательных полей.' }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ ok: true });
    const originalFileValidation = validateMultipartFiles(file ? [file] : [], { maxFiles: 1, maxFileBytes: FIVE_MB_IN_BYTES, maxTotalBytes: FIVE_MB_IN_BYTES });
    if (!originalFileValidation.ok) return multipartErrorResponse(originalFileValidation);
    const designerFilesValidation = validateMultipartFiles(designerSourceFiles, { maxFiles: DESIGNER_FILES_MAX_COUNT, maxFileBytes: FIVE_MB_IN_BYTES, maxTotalBytes: DESIGNER_FILES_MAX_TOTAL_BYTES });
    if (!designerFilesValidation.ok) return multipartErrorResponse(designerFilesValidation);
    if (file) { const validation = validateUploadedFile({ file, allowedMimeTypes: allowedMimeTypesSet, allowedExtensions: allowedExtensionsSet, maxBytes: FIVE_MB_IN_BYTES }); if (!validation.ok) return NextResponse.json({ ok: false, error: validation.error }, { status: 400 }); }
    for (const sourceFile of designerSourceFiles) { const validation = await validateUploadedImageFile({ file: sourceFile, allowedMimeTypes: designerMimeTypes, allowedExtensions: designerExtensions, maxBytes: FIVE_MB_IN_BYTES }); if (!validation.ok) return NextResponse.json({ ok: false, error: 'Исходники конструктора должны быть изображениями PNG или JPEG до 5 МБ.' }, { status: 400 }); }
    if (rawImageDataUrl && !parseDataUrl(rawImageDataUrl, allowedMimeTypesSet, FIVE_MB_IN_BYTES)) return NextResponse.json({ ok: false, error: 'Некорректный исходник клиента.' }, { status: 400 });
    const preview = mugDesignPreviewDataUrl ? parseDataUrl(mugDesignPreviewDataUrl, designerMimeTypes, DESIGN_EXPORT_MAX_BYTES) : null;
    const printLayout = mugPrintLayoutDataUrl ? parseDataUrl(mugPrintLayoutDataUrl, designerMimeTypes, DESIGN_EXPORT_MAX_BYTES) : null;
    if ((mugDesignPreviewDataUrl && (!preview || !hasSupportedImageSignature(preview))) || (mugPrintLayoutDataUrl && (!printLayout || !hasSupportedImageSignature(printLayout)))) return NextResponse.json({ ok: false, error: 'Экспорт конструктора должен быть изображением PNG или JPEG допустимого размера.' }, { status: 400 });
    if (Boolean(preview) !== Boolean(printLayout)) return NextResponse.json({ ok: false, error: 'Приложите оба экспорта конструктора.' }, { status: 400 });
    if (mugDesignJson) { try { JSON.parse(mugDesignJson); } catch { return NextResponse.json({ ok: false, error: 'Некорректные данные макета конструктора.' }, { status: 400 }); } }
    const normalizedPhone = normalizePhone(parsed.data.phone);
    if (!normalizedPhone) return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    if (!isKnownCovering(parsed.data.covering)) return NextResponse.json({ ok: false, error: 'Выберите корректное покрытие.' }, { status: 400 });
    if (!parsed.data.consent) return NextResponse.json({ ok: false, error: 'Необходимо согласие на обработку персональных данных.' }, { status: 400 });
    const text = buildMugsText({ name: parsed.data.name, phone: normalizedPhone, quantity: parsed.data.quantity, coveringLabel: getCoveringLabel(parsed.data.covering), consent: parsed.data.consent, comment: parsed.data.comment, needsDesign, rawAttached: Boolean(rawImageDataUrl || file), constructorAttached: Boolean(preview) });
    const attachments: EmailAttachment[] = [];
    if (file) attachments.push({ filename: sanitizeUploadFileName(file.name), content: Buffer.from(await file.arrayBuffer()), contentType: file.type || 'application/octet-stream' });
    if (preview) attachments.push({ filename: 'mug-design-preview.png', content: preview.buffer, contentType: preview.mime });
    if (printLayout) attachments.push({ filename: 'mug-print-layout.png', content: printLayout.buffer, contentType: printLayout.mime });
    if (mugDesignJson) attachments.push({ filename: 'mug-design.json', content: Buffer.from(mugDesignJson, 'utf8'), contentType: 'application/json' });
    for (const [index, sourceFile] of designerSourceFiles.entries()) attachments.push({ filename: `designer-source-${index + 1}-${sanitizeUploadFileName(sourceFile.name)}`, content: Buffer.from(await sourceFile.arrayBuffer()), contentType: sourceFile.type });
    const [telegramSent, emailSent] = await Promise.all([sendMugsTelegramNotification({ text, file, rawImageDataUrl, preview, printLayout }), sendEmailLead({ subject: 'Новая заявка — Печать на кружках', html: buildEmailHtmlFromText(text), attachments }).then(() => true).catch((error) => { logger.error('mugs.email.failed', { error }); return false; })]);
    if (!telegramSent && !emailSent) return NextResponse.json({ ok: false, error: 'Не удалось отправить уведомления в Telegram и Email.' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (error) { const message = error instanceof Error ? error.message : 'Unknown server error.'; if (message.startsWith('[env]')) return NextResponse.json({ ok: false, error: message }, { status: 500 }); logger.error('mugs.request.failed', { error }); return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 }); }
}

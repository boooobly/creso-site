import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, hasUserAgent, isRateLimited } from '@/lib/anti-spam';
import { logger } from '@/lib/logger';
import { sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';
import { sendTelegramDocumentBuffer } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import { env } from '@/lib/env';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';

export const runtime = 'nodejs';

const MUGS_MAX_UPLOAD_SIZE_MB = 50;
const MUGS_ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.cdr', '.ai', '.eps', '.dxf', '.svg'] as const;
const MUGS_ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/postscript',
  'application/illustrator',
  'application/dxf',
  'image/vnd.dxf',
  'image/svg+xml',
] as const;

const mugsRequestSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1),
  finish: z.enum(['Глянец', 'Мат']),
  comment: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

const allowedExtensionsSet = new Set<string>(MUGS_ALLOWED_EXTENSIONS);
const allowedMimeTypesSet = new Set<string>(MUGS_ALLOWED_MIME_TYPES);

function toText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isAllowedFile(file: File): boolean {
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}` : '';
  const mime = file.type.toLowerCase();
  return allowedExtensionsSet.has(extension) || allowedMimeTypesSet.has(mime);
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
  return `${(size / (1024 * 1024)).toFixed(2)} МБ`;
}

function buildRequestText(params: {
  name: string;
  phone: string;
  quantity: number;
  finish: 'Глянец' | 'Мат';
  comment?: string;
  file: File | null;
}): string {
  const discountLine = params.quantity >= 10 ? 'Скидка: 10% (от 10 шт)' : 'Скидка: —';

  return [
    '🆕 Новая заявка — Печать на кружках',
    '',
    'Услуга: Печать на кружках',
    'Продукт: Белая керамическая кружка 330 мл',
    'Качество: Класс AAA',
    'Цена: 450 ₽/шт (круговой перенос)',
    discountLine,
    '',
    `Имя: ${params.name}`,
    `Телефон: ${params.phone}`,
    `Количество: ${params.quantity}`,
    `Покрытие: ${params.finish}`,
    `Комментарий: ${params.comment || '—'}`,
    `Файл: ${params.file ? `${params.file.name} (${formatFileSize(params.file.size)})` : 'не прикреплён'}`,
  ].join('\n');
}

function buildTelegramCaption(params: {
  name: string;
  phone: string;
  quantity: number;
  finish: 'Глянец' | 'Мат';
  comment?: string;
}): string {
  const lines = [
    'Услуга: Печать на кружках',
    `Имя: ${params.name}`,
    `Телефон: ${params.phone}`,
    `Количество: ${params.quantity}`,
    `Покрытие: ${params.finish}`,
    `Комментарий: ${params.comment || '—'}`,
  ];

  if (params.quantity >= 10) {
    lines.push('Скидка: 10% (от 10 шт)');
  }

  return lines.join('\n');
}

async function sendMugsTelegram(params: {
  text: string;
  file: File | null;
  name: string;
  phone: string;
  quantity: number;
  finish: 'Глянец' | 'Мат';
  comment?: string;
}): Promise<void> {
  if (!params.file) {
    await sendTelegramLead(params.text);
    return;
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Telegram не настроен.');
  }

  const bytes = Buffer.from(await params.file.arrayBuffer());
  await sendTelegramDocumentBuffer({
    chatId,
    token,
    caption: buildTelegramCaption({
      name: params.name,
      phone: params.phone,
      quantity: params.quantity,
      finish: params.finish,
      comment: params.comment,
    }),
    bytes,
    filename: params.file.name || 'upload.bin',
    contentType: params.file.type || 'application/octet-stream',
  });
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
    const fileValue = formData.get('file');

    const parsed = mugsRequestSchema.safeParse({
      name: toText(formData.get('name')),
      phone: toText(formData.get('phone')),
      quantity: toText(formData.get('quantity')),
      finish: toText(formData.get('finish')),
      comment: toText(formData.get('comment')),
      website: toText(formData.get('website')),
    });

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Проверьте заполнение обязательных полей.' }, { status: 400 });
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const normalizedPhone = normalizePhone(parsed.data.phone);
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    }

    const file = fileValue instanceof File ? fileValue : null;

    if (file && !isAllowedFile(file)) {
      return NextResponse.json({ ok: false, error: 'Разрешены только PNG, JPG, JPEG, WEBP, PDF, CDR, AI, EPS, DXF, SVG.' }, { status: 400 });
    }

    if (file && (file.size <= 0 || file.size > MUGS_MAX_UPLOAD_SIZE_MB * 1024 * 1024)) {
      return NextResponse.json({ ok: false, error: `Размер файла должен быть от 1 байта до ${MUGS_MAX_UPLOAD_SIZE_MB} МБ.` }, { status: 400 });
    }

    const text = buildRequestText({
      name: parsed.data.name,
      phone: normalizedPhone,
      quantity: parsed.data.quantity,
      finish: parsed.data.finish,
      comment: parsed.data.comment,
      file,
    });

    const emailText = file
      ? `${text}\n\nФайл прикреплён и отправлен в Telegram: ${file.name} (${formatFileSize(file.size)})`
      : text;

    await Promise.all([
      sendMugsTelegram({
        text,
        file,
        name: parsed.data.name,
        phone: normalizedPhone,
        quantity: parsed.data.quantity,
        finish: parsed.data.finish,
        comment: parsed.data.comment,
      }),
      sendEmailLead({
        subject: 'Новая заявка — Печать на кружках',
        html: buildEmailHtmlFromText(emailText),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('api.requests.mugs.failed', { error });
    return NextResponse.json({ ok: false, error: 'Не удалось отправить заявку. Попробуйте позже.' }, { status: 500 });
  }
}

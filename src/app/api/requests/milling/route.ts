import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp, hasUserAgent, isRateLimited } from '@/lib/anti-spam';
import { sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';
import { logger } from '@/lib/logger';
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
    if (!file) {
      return NextResponse.json({ ok: false, error: 'Загрузите файл с макетом.' }, { status: 400 });
    }

    if (!isAllowedFile(file)) {
      return NextResponse.json({ ok: false, error: 'Разрешены только PDF, CDR, AI, EPS, DXF, SVG.' }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MILLING_MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
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

    const text = [
      '🆕 Новая заявка — Фрезеровка листовых материалов',
      '',
      `Имя: ${parsed.data.name}`,
      `Телефон: ${normalizedPhone}`,
      `Материал: ${parsed.data.material}`,
      `Толщина: ${parsed.data.thickness}`,
      `Нужна помощь с подготовкой файла: ${parsed.data.helpWithPrep ? 'Да' : 'Нет'}`,
      `Комментарий: ${parsed.data.comment || '—'}`,
      `Файл: ${file.name}`,
      `Размер файла: ${formatFileSize(file.size)}`,
      `MIME: ${file.type || 'не указан'}`,
      `Страница: ${request.headers.get('referer') || request.headers.get('origin') || '—'}`,
      `IP: ${getClientIp(request)}`,
    ].join('\n');

    await Promise.all([
      sendTelegramLead(text).catch((error) => {
        logger.error('milling.telegram.failed', { error });
      }),
      sendEmailLead({
        subject: 'Новая заявка — Фрезеровка листовых материалов',
        html: buildEmailHtmlFromText(text),
      }).catch((error) => {
        logger.error('milling.email.failed', { error });
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';
import { getServerEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { validateUploadedFile } from '@/lib/file-validation';
import { sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';
import { sendTelegramDocumentBuffer } from '@/lib/notifications/telegram/sendDocumentWithCaption';
import {
  MUGS_ALLOWED_EXTENSIONS,
  MUGS_ALLOWED_MIME_TYPES,
  MUGS_MAX_UPLOAD_SIZE_MB,
} from '@/lib/pricing-config/mugs';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';

export const runtime = 'nodejs';

const allowedExtensionsSet = new Set<string>(MUGS_ALLOWED_EXTENSIONS);
const allowedMimeTypesSet = new Set<string>(MUGS_ALLOWED_MIME_TYPES);

const tshirtsRequestSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  comment: z.string().trim().optional(),
  consent: z.literal('true'),
  website: z.string().trim().optional(),
});

function toText(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function formatFileSize(size: number): string {
  return `${(size / 1024 / 1024).toFixed(2)} МБ`;
}

function buildTshirtsText(params: {
  name: string;
  phone: string;
  comment?: string;
  file: File | null;
  referer: string;
}): string {
  return [
    '🆕 Новая заявка — Печать на футболках',
    '',
    'Услуга: Печать на футболках',
    `Имя: ${params.name}`,
    `Телефон: ${params.phone}`,
    `Комментарий: ${params.comment || '—'}`,
    `Файл: ${params.file ? `${params.file.name} (${formatFileSize(params.file.size)})` : 'не прикреплён'}`,
    `Страница: ${params.referer || '—'}`,
  ].join('\n');
}

async function sendTshirtsTelegramNotification(params: {
  text: string;
  file: File | null;
  referer: string;
  name: string;
  phone: string;
  comment?: string;
}): Promise<boolean> {
  const env = getServerEnv();
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.warn('tshirts.telegram.not_configured');
    return false;
  }

  try {
    await sendTelegramLead(params.text);
  } catch (error) {
    logger.error('tshirts.telegram.message_failed', { error });
    return false;
  }

  if (!params.file) {
    return true;
  }

  const caption = [
    'Макет к заявке — Печать на футболках',
    '',
    'Услуга: Печать на футболках',
    `Имя: ${params.name}`,
    `Телефон: ${params.phone}`,
    `Комментарий: ${params.comment || '—'}`,
    `Страница: ${params.referer || '—'}`,
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
  } catch (error) {
    logger.error('tshirts.telegram.document_failed', { error });
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    getServerEnv();

    const formData = await request.formData();
    const fileValue = formData.get('file');

    const blockedResponse = enforcePublicRequestGuard(request, {
      route: '/api/requests/tshirts',
      payload: {
        name: toText(formData.get('name')),
        phone: toText(formData.get('phone')),
        comment: toText(formData.get('comment')),
        consent: toText(formData.get('consent')),
        website: toText(formData.get('website')),
      },
      requirePayload: true,
    });

    if (blockedResponse) {
      return blockedResponse;
    }

    const parsed = tshirtsRequestSchema.safeParse({
      name: toText(formData.get('name')),
      phone: toText(formData.get('phone')),
      comment: toText(formData.get('comment')),
      consent: toText(formData.get('consent')),
      website: toText(formData.get('website')),
    });

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Проверьте заполнение обязательных полей.' }, { status: 400 });
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const file = fileValue instanceof File ? fileValue : null;

    if (file) {
      const fileValidation = validateUploadedFile({
        file,
        allowedMimeTypes: allowedMimeTypesSet,
        allowedExtensions: allowedExtensionsSet,
        maxBytes: MUGS_MAX_UPLOAD_SIZE_MB * 1024 * 1024,
      });

      if (!fileValidation.ok) {
        return NextResponse.json({ ok: false, error: fileValidation.error }, { status: 400 });
      }
    }

    const normalizedPhone = normalizePhone(parsed.data.phone);
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    }

    const text = buildTshirtsText({
      name: parsed.data.name,
      phone: normalizedPhone,
      comment: parsed.data.comment,
      file,
      referer: request.headers.get('referer') || request.headers.get('origin') || '',
    });

    const [telegramSent, emailSent] = await Promise.all([
      sendTshirtsTelegramNotification({
        text,
        file,
        referer: request.headers.get('referer') || request.headers.get('origin') || '',
        name: parsed.data.name,
        phone: normalizedPhone,
        comment: parsed.data.comment,
      }),
      sendEmailLead({
        subject: 'Новая заявка — Печать на футболках',
        html: buildEmailHtmlFromText(text),
      })
        .then(() => true)
        .catch((error) => {
          logger.error('tshirts.email.failed', { error });
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
    logger.error('tshirts.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

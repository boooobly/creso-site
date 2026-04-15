import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmailLead } from '@/lib/notifications/email';
import { buildLeadNotificationText, type LeadNotificationFile } from '@/lib/notifications/leadNotificationUtils';
import { sendTelegramLead, sendTelegramDocumentBuffer } from '@/lib/notifications/telegram';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';
import { enforcePublicRequestGuard, getClientIp } from '@/lib/anti-spam';
import { sourceTitle } from '@/lib/utils/sourceTitle';
import { getServerEnv } from '@/lib/env';

import { logger } from '@/lib/logger';
export const runtime = 'nodejs';

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z.string().optional(),
);

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z.string().email().optional(),
);

const optionalPositiveNumber = z.preprocess(
  (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
  },
  z.number().positive().optional(),
);

const leadSchema = z.object({
  source: z.string().trim().min(1),
  name: z.string().trim().min(2),
  phone: optionalTrimmedString,
  email: optionalEmail,
  widthMm: optionalPositiveNumber,
  heightMm: optionalPositiveNumber,
  comment: optionalTrimmedString,
  pageUrl: optionalTrimmedString,
  extras: z.record(z.unknown()).optional(),
  company: optionalTrimmedString,
}).superRefine((value, ctx) => {
  if (!value.phone && !value.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['phone'],
      message: 'Укажите телефон или e-mail.',
    });
  }
});

type ParsedLeadRequest = {
  payload: unknown;
  files: File[];
};

async function parseLeadRequest(request: NextRequest): Promise<ParsedLeadRequest> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const extrasRaw = formData.get('extras');
    let extras: Record<string, unknown> | undefined;

    if (typeof extrasRaw === 'string' && extrasRaw.trim()) {
      try {
        const parsed = JSON.parse(extrasRaw) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          extras = parsed as Record<string, unknown>;
        }
      } catch (error) {
        logger.warn('leads.multipart.invalid_extras_json', { error });
      }
    }

    const files = formData
      .getAll('files')
      .filter((value): value is File => value instanceof File && value.size > 0);

    return {
      payload: {
        source: typeof formData.get('source') === 'string' ? formData.get('source') : undefined,
        name: typeof formData.get('name') === 'string' ? formData.get('name') : undefined,
        phone: typeof formData.get('phone') === 'string' ? formData.get('phone') : undefined,
        email: typeof formData.get('email') === 'string' ? formData.get('email') : undefined,
        widthMm: typeof formData.get('widthMm') === 'string' ? formData.get('widthMm') : undefined,
        heightMm: typeof formData.get('heightMm') === 'string' ? formData.get('heightMm') : undefined,
        comment: typeof formData.get('comment') === 'string' ? formData.get('comment') : undefined,
        pageUrl: typeof formData.get('pageUrl') === 'string' ? formData.get('pageUrl') : undefined,
        company: typeof formData.get('company') === 'string' ? formData.get('company') : undefined,
        extras,
      },
      files,
    };
  }

  return {
    payload: await request.json().catch(() => null),
    files: [],
  };
}

async function sendLeadTelegramFiles(params: { files: LeadNotificationFile[] }): Promise<void> {
  if (params.files.length === 0) return;

  const env = getServerEnv();
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  for (const file of params.files) {
    if (!file.bytes) continue;

    try {
      await sendTelegramDocumentBuffer({
        chatId,
        token,
        caption: `Файл: ${file.name}`,
        bytes: file.bytes,
        filename: file.name,
        mime: file.type || 'application/octet-stream',
      });
    } catch (error) {
      logger.error('leads.telegram.document_failed', { error, fileName: file.name, fileSize: file.size });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { payload, files } = await parseLeadRequest(request);

    const blockedResponse = enforcePublicRequestGuard(request, {
      route: '/api/leads',
      payload,
      requirePayload: true,
    });

    if (blockedResponse) {
      return blockedResponse;
    }
    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    if (parsed.data.company?.trim()) {
      return NextResponse.json({ ok: true });
    }

    const normalizedPhone = parsed.data.phone ? normalizePhone(parsed.data.phone) || undefined : undefined;
    if (parsed.data.phone && !normalizedPhone) {
      return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    }

    const notificationFiles: LeadNotificationFile[] = await Promise.all(
      files.map(async (file) => ({
        name: file.name || 'upload.bin',
        size: file.size,
        type: file.type || 'application/octet-stream',
        bytes: Buffer.from(await file.arrayBuffer()),
      })),
    );

    const referer = request.headers.get('referer') || request.headers.get('origin') || '';
    const text = buildLeadNotificationText({
      ...parsed.data,
      phone: normalizedPhone,
      pageUrl: parsed.data.pageUrl || referer,
      files: notificationFiles,
    });

    await Promise.all([
      sendTelegramLead(text)
        .then(async () => {
          await sendLeadTelegramFiles({ files: notificationFiles });
        })
        .catch((error) => {
          console.error('[leads] Telegram send failed', error);
        }),
      sendEmailLead({
        subject: `Новая заявка: ${sourceTitle(parsed.data.source)}`,
        html: buildEmailHtmlFromText(text),
      }).catch((error) => {
        console.error('[leads] Email send failed', error);
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

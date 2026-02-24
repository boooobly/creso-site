import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { normalizePhone } from '@/lib/utils/phone';
import { getClientIp } from '@/lib/utils/request';
import { isRateLimited } from '@/lib/anti-spam';
import { sourceTitle } from '@/lib/utils/sourceTitle';

import { logger } from '@/lib/logger';
export const runtime = 'nodejs';

const leadSchema = z.object({
  source: z.string().trim().min(1),
  name: z.string().trim().min(2),
  phone: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
  widthMm: z.number().positive().optional(),
  heightMm: z.number().positive().optional(),
  comment: z.string().trim().optional(),
  extras: z.record(z.unknown()).optional(),
  company: z.string().optional(),
});

function formatValue(value?: string | number | null): string {
  if (value === null || value === undefined) return '—';
  const text = String(value).trim();
  return text || '—';
}

function buildText(params: {
  source: string;
  name: string;
  phone: string;
  email?: string;
  widthMm?: number;
  heightMm?: number;
  comment?: string;
  extras?: Record<string, unknown>;
  referer: string;
  ua: string;
  ip: string;
}) {
  const size = params.widthMm && params.heightMm ? `${params.widthMm} x ${params.heightMm} мм` : '—';
  const extras = params.extras ? JSON.stringify(params.extras, null, 2) : '';

  return [
    `🧾 Новая заявка: ${sourceTitle(params.source)}`,
    `Имя: ${formatValue(params.name)}`,
    `Телефон: ${formatValue(params.phone)}`,
    `Email: ${formatValue(params.email)}`,
    `Размер: ${size}`,
    `Комментарий: ${formatValue(params.comment)}`,
    `Страница: ${formatValue(params.referer)}`,
    `Время: ${new Date().toISOString()}`,
    `User-Agent: ${formatValue(params.ua)}`,
    `IP: ${formatValue(params.ip)}`,
    extras ? `Дополнительно:\n${extras}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false, error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 });
    }

    const payload = await request.json().catch(() => null);
    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    if (parsed.data.company?.trim()) {
      return NextResponse.json({ ok: true });
    }

    const normalizedPhone = normalizePhone(parsed.data.phone);
    if (!normalizedPhone) {
      return NextResponse.json({ ok: false, error: 'Укажите телефон в формате +7XXXXXXXXXX.' }, { status: 400 });
    }

    const ua = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || request.headers.get('origin') || '';

    const text = buildText({
      ...parsed.data,
      phone: normalizedPhone,
      referer,
      ua,
      ip,
    });

    await Promise.all([
      sendTelegramLead(text).catch((error) => {
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

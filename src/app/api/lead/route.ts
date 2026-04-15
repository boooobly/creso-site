import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';

import { logger } from '@/lib/logger';
const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  service: z.string().min(2),
  message: z.string().optional(),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const blockedResponse = enforcePublicRequestGuard(req, {
      route: '/api/lead',
      payload,
      honeypotFields: ['website'],
      requirePayload: true,
    });

    if (blockedResponse) {
      return blockedResponse;
    }

    const parsed = leadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    const calculationDetails = parsed.data.message?.includes('Расчёт:') ? parsed.data.message : undefined;

    return NextResponse.json({ ok: true, calculationDetails });
  } catch (error) {
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

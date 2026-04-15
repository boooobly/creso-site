import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { POST as postCanonicalLead } from '@/app/api/leads/route';

import { logger } from '@/lib/logger';
const legacyLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  service: z.string().min(2),
  message: z.string().optional(),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => null);
    const parsed = legacyLeadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Не заполнены обязательные поля.' }, { status: 400 });
    }

    const commentParts = [parsed.data.service, parsed.data.message]
      .map((value) => value?.trim())
      .filter(Boolean);
    const canonicalPayload = {
      source: 'legacy-lead-form',
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      comment: commentParts.length > 0 ? commentParts.join('\n') : undefined,
    };
    const nextRequest = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(canonicalPayload),
    });

    const response = await postCanonicalLead(nextRequest);
    response.headers.set('x-creso-api-deprecated', 'true');
    response.headers.set('x-creso-api-canonical', '/api/leads');
    response.headers.append('warning', '299 - "/api/lead deprecated; use /api/leads"');

    return response;
  } catch (error) {
    logger.error('api.request.failed', { error });
    return NextResponse.json({ ok: false, error: 'Ошибка обработки заявки.' }, { status: 500 });
  }
}

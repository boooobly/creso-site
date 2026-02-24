import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getServerEnv } from '@/lib/env';

import { logger } from '@/lib/logger';
export const runtime = 'nodejs';

const webhookSchema = z.object({
  orderNumber: z.string().trim().min(1),
  status: z.enum(['paid', 'failed']),
  paidAmount: z.number().int().positive().optional(),
});

function getRequestIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

function verifyWebhookSignature(params: {
  body: string;
  signature: string;
  secret: string;
}): boolean {
  const expected = createHmac('sha256', params.secret)
    .update(params.body)
    .digest('hex');

  const receivedBuffer = Buffer.from(params.signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const env = getServerEnv();
    const secret = env.PAYMENT_WEBHOOK_SECRET;

    if (!secret) {
      logger.error('payments.webhook.misconfigured', {
        reason: 'PAYMENT_WEBHOOK_SECRET is missing',
      });
      return NextResponse.json({ ok: false, error: 'Webhook is not configured.' }, { status: 500 });
    }

    const signature = request.headers.get('x-webhook-signature')?.trim();
    if (!signature) {
      logger.warn('payments.webhook.unauthorized', {
        reason: 'missing signature header',
        ip: getRequestIp(request),
      });
      return NextResponse.json({ ok: false, error: 'Unauthorized webhook request.' }, { status: 401 });
    }

    const rawBody = await request.text();
    const hasValidSignature = verifyWebhookSignature({
      body: rawBody,
      signature,
      secret,
    });

    if (!hasValidSignature) {
      logger.warn('payments.webhook.unauthorized', {
        reason: 'invalid signature',
        ip: getRequestIp(request),
      });
      return NextResponse.json({ ok: false, error: 'Unauthorized webhook request.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as unknown;
    const parsed = webhookSchema.safeParse(payload);

    if (!parsed.success) {
      logger.warn('payments.webhook.invalid_payload', {
        ip: getRequestIp(request),
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      });
      return NextResponse.json({ ok: false, error: 'Invalid webhook payload.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { number: parsed.data.orderNumber },
      select: {
        id: true,
        total: true,
        prepayRequired: true,
        prepayAmount: true,
      },
    });

    if (!order) {
      logger.warn('payments.webhook.order_not_found', {
        orderNumber: parsed.data.orderNumber,
        ip: getRequestIp(request),
      });
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 });
    }

    if (parsed.data.status === 'paid') {
      const computedAmount = order.prepayRequired ? Number(order.prepayAmount ?? 0) : Number(order.total);
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          paidAmount: parsed.data.paidAmount ?? computedAmount,
          paidAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'failed',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.warn('payments.webhook.invalid_json', {
        message: error.message,
      });
      return NextResponse.json({ ok: false, error: 'Invalid webhook payload.' }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }

    logger.error('payments.webhook.failed', { error });
    return NextResponse.json({ ok: false, error: 'Webhook handling failed.' }, { status: 500 });
  }
}

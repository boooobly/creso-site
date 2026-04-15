import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getServerEnv } from '@/lib/env';
import { hasValidOrderAccessToken, isAdminAuthorized } from '@/lib/orders/access';

import { logger } from '@/lib/logger';
export const runtime = 'nodejs';

const createPaymentSchema = z.object({
  orderNumber: z.string().trim().min(1),
  token: z.string().trim().min(1).optional(),
});

function generatePaymentRef(): string {
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `pay_${Date.now()}_${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const env = getServerEnv();
    const payload = await request.json().catch(() => null);
    const parsed = createPaymentSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Некорректные параметры запроса.' }, { status: 400 });
    }

    const tokenSecret = env.ORDER_TOKEN_SECRET || env.ADMIN_TOKEN;
    const hasValidSignedToken = hasValidOrderAccessToken({
      token: parsed.data.token,
      orderNumber: parsed.data.orderNumber,
      secret: tokenSecret,
    });
    const hasAdminAccess = isAdminAuthorized(request, env.ADMIN_TOKEN);

    if (!hasValidSignedToken && !hasAdminAccess) {
      return NextResponse.json({ ok: false, error: 'Нет доступа к созданию оплаты по этому заказу.' }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { number: parsed.data.orderNumber },
      select: {
        number: true,
        total: true,
        prepayRequired: true,
        prepayAmount: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Заказ не найден.' }, { status: 404 });
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ ok: false, error: 'Заказ уже оплачен.' }, { status: 409 });
    }

    const amount = order.prepayRequired ? Number(order.prepayAmount ?? 0) : Number(order.total);
    const paymentRef = generatePaymentRef();

    await prisma.order.update({
      where: { number: order.number },
      data: {
        paymentStatus: 'pending',
        paymentProvider: 'mock',
        paymentRef,
      },
    });

    const tokenQuery = hasValidSignedToken && parsed.data.token
      ? `&token=${encodeURIComponent(parsed.data.token)}`
      : '';

    return NextResponse.json({
      orderNumber: order.number,
      paymentStatus: 'pending',
      provider: 'mock',
      paymentRef,
      amount,
      redirectUrl: `/pay/mock?ref=${encodeURIComponent(paymentRef)}&order=${encodeURIComponent(order.number)}${tokenQuery}`,
    });
  } catch (error) {
    logger.error('payments.create.failed', { error });
    return NextResponse.json({ ok: false, error: 'Не удалось создать сессию оплаты.' }, { status: 500 });
  }
}

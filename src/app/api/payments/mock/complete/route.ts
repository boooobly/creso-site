import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getServerEnv } from '@/lib/env';
import { hasValidOrderAccessToken, isAdminAuthorized } from '@/lib/orders/access';

import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const mockCompleteSchema = z.object({
  orderNumber: z.string().trim().min(1),
  paymentRef: z.string().trim().min(1),
  status: z.enum(['paid', 'failed']),
  token: z.string().trim().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const env = getServerEnv();
    const payload = await request.json().catch(() => null);
    const parsed = mockCompleteSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Некорректные параметры mock-оплаты.' }, { status: 400 });
    }

    const tokenSecret = env.ORDER_TOKEN_SECRET || env.ADMIN_TOKEN;
    const hasValidSignedToken = hasValidOrderAccessToken({
      token: parsed.data.token,
      orderNumber: parsed.data.orderNumber,
      secret: tokenSecret,
    });
    const hasAdminAccess = isAdminAuthorized(request, env.ADMIN_TOKEN);

    if (!hasValidSignedToken && !hasAdminAccess) {
      return NextResponse.json({ ok: false, error: 'Нет доступа к обновлению статуса оплаты.' }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { number: parsed.data.orderNumber },
      select: {
        id: true,
        number: true,
        total: true,
        prepayRequired: true,
        prepayAmount: true,
        paymentProvider: true,
        paymentRef: true,
      },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Заказ не найден.' }, { status: 404 });
    }

    if (!order.paymentRef || order.paymentRef !== parsed.data.paymentRef) {
      return NextResponse.json({ ok: false, error: 'Некорректный платёжный референс.' }, { status: 400 });
    }

    if (order.paymentProvider && order.paymentProvider !== 'mock') {
      return NextResponse.json({ ok: false, error: 'Mock-оплата недоступна для этого провайдера.' }, { status: 409 });
    }

    if (parsed.data.status === 'paid') {
      const paidAmount = order.prepayRequired ? Number(order.prepayAmount ?? 0) : Number(order.total);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          paidAmount,
          paidAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true, paymentStatus: 'paid' });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'failed',
        paidAmount: null,
        paidAt: null,
      },
    });

    return NextResponse.json({ ok: true, paymentStatus: 'failed' });
  } catch (error) {
    logger.error('payments.mock.complete.failed', { error });
    return NextResponse.json({ ok: false, error: 'Не удалось завершить mock-оплату.' }, { status: 500 });
  }
}

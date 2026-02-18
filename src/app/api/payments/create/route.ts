import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaClient } from '@/lib/db/prisma';

const createPaymentSchema = z.object({
  orderNumber: z.string().trim().min(1),
});

function generatePaymentRef(): string {
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `pay_${Date.now()}_${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = createPaymentSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request payload.' }, { status: 400 });
    }

    const order = await (getPrismaClient() as any).order.findUnique({
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
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 });
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ ok: false, error: 'Already paid' }, { status: 409 });
    }

    const amount = order.prepayRequired ? Number(order.prepayAmount ?? 0) : Number(order.total);
    const paymentRef = generatePaymentRef();

    await (getPrismaClient() as any).order.update({
      where: { number: order.number },
      data: {
        paymentStatus: 'pending',
        paymentProvider: 'mock',
        paymentRef,
      },
    });

    return NextResponse.json({
      orderNumber: order.number,
      paymentStatus: 'pending',
      provider: 'mock',
      paymentRef,
      amount,
      redirectUrl: `/pay/mock?ref=${encodeURIComponent(paymentRef)}`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Payment session creation failed.' }, { status: 500 });
  }
}

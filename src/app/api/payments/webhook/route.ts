import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

const webhookSchema = z.object({
  paymentRef: z.string().trim().min(1),
  status: z.enum(['paid', 'failed']),
  paidAmount: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = webhookSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid webhook payload.' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { paymentRef: parsed.data.paymentRef },
      select: {
        id: true,
        total: true,
        prepayRequired: true,
        prepayAmount: true,
      },
    });

    if (!order) {
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
  } catch {
    return NextResponse.json({ ok: false, error: 'Webhook handling failed.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

type Params = {
  params: {
    number: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        number: params.number,
      },
      select: {
        number: true,
        status: true,
        createdAt: true,
        customerName: true,
        phone: true,
        email: true,
        comment: true,
        total: true,
        prepayRequired: true,
        prepayAmount: true,
        paymentStatus: true,
        paymentProvider: true,
        paymentRef: true,
        paidAmount: true,
        paidAt: true,
        payloadJson: true,
        quoteJson: true,
      },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Заказ не найден.' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ ok: false, error: 'Ошибка получения заказа.' }, { status: 500 });
  }
}

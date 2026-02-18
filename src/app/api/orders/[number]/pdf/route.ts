import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db/prisma';
import { buildOrderPdf } from '@/lib/pdf/buildOrderPdf';

type Params = {
  params: {
    number: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const order = await (getPrismaClient() as any).order.findUnique({
      where: {
        number: params.number,
      },
      select: {
        number: true,
        createdAt: true,
        customerName: true,
        phone: true,
        email: true,
        comment: true,
        total: true,
        prepayRequired: true,
        prepayAmount: true,
        payloadJson: true,
        quoteJson: true,
      },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Заказ не найден.' }, { status: 404 });
    }

    const pdfBytes = await buildOrderPdf({
      orderNumber: order.number,
      createdAt: order.createdAt,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email,
      comment: order.comment,
      total: order.total,
      prepayRequired: order.prepayRequired,
      prepayAmount: order.prepayAmount,
      quote: order.quoteJson,
      payload: order.payloadJson,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="order-${order.number}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Ошибка генерации PDF.' }, { status: 500 });
  }
}

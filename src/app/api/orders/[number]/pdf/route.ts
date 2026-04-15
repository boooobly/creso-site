import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { buildOrderPdf } from '@/lib/pdf/buildOrderPdf';
import { getServerEnv } from '@/lib/env';
import { hasValidOrderAccessToken, isAdminAuthorized } from '@/lib/orders/access';

import { logger } from '@/lib/logger';
export const runtime = 'nodejs';

type Params = {
  params: {
    number: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const env = getServerEnv();
    const tokenSecret = env.ORDER_TOKEN_SECRET || env.ADMIN_TOKEN;

    const token = request.nextUrl.searchParams.get('token');
    const hasValidSignedToken = hasValidOrderAccessToken({
      token,
      orderNumber: params.number,
      secret: tokenSecret,
    });

    const hasAdminAccess = isAdminAuthorized(request, env.ADMIN_TOKEN);

    if (!hasValidSignedToken && !hasAdminAccess) {
      return NextResponse.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }

    logger.error('orders.pdf.failed', { error, orderNumber: params.number });
    return NextResponse.json({ ok: false, error: 'Ошибка генерации PDF.' }, { status: 500 });
  }
}

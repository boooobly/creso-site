import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerEnv } from '@/lib/env';
import { createOrderAccessToken } from '@/lib/orders/pdfAccessToken';
import { hasValidOrderAccessToken, isAdminAuthorized } from '@/lib/orders/access';
import { getBaseUrl } from '@/lib/url/getBaseUrl';

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
      return NextResponse.json({ ok: false, error: 'Доступ к заказу запрещён.' }, { status: 403 });
    }

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
        quoteJson: true,
      },
    });

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Заказ не найден.' }, { status: 404 });
    }

    const accessToken = hasValidSignedToken && token ? token : createOrderAccessToken(order.number, tokenSecret);
    const securePdfUrl = `${getBaseUrl()}/api/orders/${encodeURIComponent(order.number)}/pdf?token=${encodeURIComponent(accessToken)}`;

    return NextResponse.json({
      ...order,
      securePdfUrl,
      accessToken,
    });
  } catch (error) {
    logger.error('orders.get.failed', { error, orderNumber: params.number });
    return NextResponse.json({ ok: false, error: 'Ошибка получения заказа.' }, { status: 500 });
  }
}

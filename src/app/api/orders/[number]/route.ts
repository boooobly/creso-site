import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerEnv } from '@/lib/env';
import { createOrderAccessToken } from '@/lib/orders/pdfAccessToken';
import { hasValidOrderAccessToken, isAdminAuthorized } from '@/lib/orders/access';
import { getBaseUrl } from '@/lib/url/getBaseUrl';

import { logger } from '@/lib/logger';
export const runtime = 'nodejs';

type Params = {
  params: Promise<{
    number: string;
  }>;
};

function toCustomerQuoteSummary(quoteJson: unknown) {
  const quote = quoteJson && typeof quoteJson === 'object' ? quoteJson as {
    effectiveSize?: { width?: unknown; height?: unknown };
    items?: Array<{ title?: unknown; total?: unknown }>;
  } : null;

  const effectiveSize = quote?.effectiveSize;
  const items = Array.isArray(quote?.items)
    ? quote.items.map((item) => ({
      title: typeof item?.title === 'string' ? item.title : undefined,
      total: typeof item?.total === 'number' ? item.total : undefined,
    }))
    : [];

  return {
    effectiveSize: {
      width: typeof effectiveSize?.width === 'number' ? effectiveSize.width : undefined,
      height: typeof effectiveSize?.height === 'number' ? effectiveSize.height : undefined,
    },
    items,
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  const resolvedParams = await params;

  try {
    const env = getServerEnv();
    const tokenSecret = env.ORDER_TOKEN_SECRET || env.ADMIN_TOKEN;

    const token = request.nextUrl.searchParams.get('token');
    const hasValidSignedToken = hasValidOrderAccessToken({
      token,
      orderNumber: resolvedParams.number,
      secret: tokenSecret,
    });
    const hasAdminAccess = isAdminAuthorized(request, env.ADMIN_TOKEN);

    if (!hasValidSignedToken && !hasAdminAccess) {
      return NextResponse.json({ ok: false, error: 'Доступ к заказу запрещён.' }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: {
        number: resolvedParams.number,
      },
      select: hasAdminAccess
        ? {
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
        }
        : {
          number: true,
          createdAt: true,
          customerName: true,
          phone: true,
          email: true,
          comment: true,
          total: true,
          prepayRequired: true,
          prepayAmount: true,
          paymentStatus: true,
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

    if (hasAdminAccess) {
      return NextResponse.json({
        ...order,
        securePdfUrl,
        accessToken,
      });
    }

    return NextResponse.json({
      number: order.number,
      createdAt: order.createdAt,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email,
      comment: order.comment,
      total: order.total,
      prepayRequired: order.prepayRequired,
      prepayAmount: order.prepayAmount,
      paymentStatus: order.paymentStatus,
      paidAmount: order.paidAmount,
      paidAt: order.paidAt,
      quoteJson: toCustomerQuoteSummary(order.quoteJson),
      securePdfUrl,
      accessToken,
    });
  } catch (error) {
    logger.error('orders.get.failed', { error, orderNumber: resolvedParams.number });
    return NextResponse.json({ ok: false, error: 'Ошибка получения заказа.' }, { status: 500 });
  }
}

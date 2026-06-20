import type { Order, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { generateOrderNumber } from '@/lib/orders/generateOrderNumber';

export type CreateServiceRequestOrderInput = {
  source: string;
  customer: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    comment?: string | null;
  };
  total?: number;
  payloadJson: Prisma.InputJsonValue;
  quoteJson?: Prisma.InputJsonValue;
};

export type CreatedServiceRequestOrder = {
  orderId: string;
  orderNumber: string;
  order: Order;
};

function nullableText(value?: string | null): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || null;
}

function isUniqueCollision(error: unknown): boolean {
  return Boolean(
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: string }).code === 'P2002',
  );
}

export async function createServiceRequestOrder(input: CreateServiceRequestOrderInput): Promise<CreatedServiceRequestOrder> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const orderNumber = generateOrderNumber();

    try {
      const order = await prisma.order.create({
        data: {
          number: orderNumber,
          source: input.source,
          status: 'new',
          customerName: nullableText(input.customer.name),
          phone: nullableText(input.customer.phone),
          email: nullableText(input.customer.email),
          comment: nullableText(input.customer.comment),
          total: Math.max(0, Math.round(Number(input.total ?? 0) || 0)),
          prepayRequired: false,
          prepayAmount: null,
          paymentStatus: 'unpaid',
          payloadJson: input.payloadJson,
          quoteJson: input.quoteJson ?? {
            kind: 'service-request',
            service: input.source,
            total: Math.max(0, Math.round(Number(input.total ?? 0) || 0)),
            pricingStatus: 'manual',
            note: 'Стоимость уточняется менеджером',
          },
        },
      });

      return { orderId: order.id, orderNumber, order };
    } catch (error) {
      if (isUniqueCollision(error) && attempt < 9) continue;
      throw error;
    }
  }

  throw new Error('Failed to create unique service request order number after 10 collision retries.');
}

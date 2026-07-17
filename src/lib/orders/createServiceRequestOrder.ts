import type { NotificationOutbox, Order, Prisma } from '@prisma/client';
import { createOrder, type PendingNotificationJob } from '@/lib/orders/createOrder';

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
  idempotencyKey?: string;
  requestHash?: string;
  buildNotificationJobs?: (orderNumber: string) => PendingNotificationJob[];
};

export type CreatedServiceRequestOrder = {
  orderId: string;
  orderNumber: string;
  order: Order;
  notificationJobs: NotificationOutbox[];
  reused: boolean;
};

function nullableText(value?: string | null): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || null;
}

export async function createServiceRequestOrder(input: CreateServiceRequestOrderInput): Promise<CreatedServiceRequestOrder> {
  return createOrder({
    source: input.source,
    customerName: nullableText(input.customer.name),
    phone: nullableText(input.customer.phone),
    email: nullableText(input.customer.email),
    comment: nullableText(input.customer.comment),
    total: input.total ?? 0,
    payloadJson: input.payloadJson,
    quoteJson: input.quoteJson ?? {
      kind: 'service-request',
      service: input.source,
      total: Math.max(0, Math.round(Number(input.total ?? 0) || 0)),
      pricingStatus: 'manual',
      note: 'Стоимость уточняется менеджером',
    },
    idempotencyKey: input.idempotencyKey,
    requestHash: input.requestHash,
    buildNotificationJobs: input.buildNotificationJobs,
  });
}

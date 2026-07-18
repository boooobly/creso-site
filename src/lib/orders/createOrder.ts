import type { NotificationOutbox, Order, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { generateOrderNumber } from '@/lib/orders/generateOrderNumber';
import { IdempotencyConflictError } from '@/lib/orders/idempotency';

export type PendingNotificationJob = {
  kind: string;
  dedupeSuffix: string;
  payloadJson: Prisma.InputJsonValue;
  maxAttempts?: number;
};

export type CreateOrderInput = {
  source: string;
  customerName?: string | null;
  phone?: string | null;
  email?: string | null;
  comment?: string | null;
  total: number;
  prepayRequired?: boolean;
  prepayAmount?: number | null;
  payloadJson: Prisma.InputJsonValue;
  quoteJson: Prisma.InputJsonValue;
  idempotencyKey?: string;
  requestHash?: string;
  buildNotificationJobs?: (orderNumber: string) => PendingNotificationJob[];
};

export type CreatedOrder = {
  orderId: string;
  orderNumber: string;
  order: Order;
  notificationJobs: NotificationOutbox[];
  reused: boolean;
};

function isUniqueCollision(error: unknown): boolean {
  return Boolean(
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: string }).code === 'P2002',
  );
}

export async function findOrderByIdempotency(params: {
  source: string;
  idempotencyKey?: string;
  requestHash?: string;
}): Promise<CreatedOrder | null> {
  if (!params.idempotencyKey) return null;

  const existing = await prisma.order.findUnique({
    where: {
      source_idempotencyKey: {
        source: params.source,
        idempotencyKey: params.idempotencyKey,
      },
    },
    include: { notificationJobs: true },
  });

  if (!existing) return null;
  if (!params.requestHash || existing.requestHash !== params.requestHash) {
    throw new IdempotencyConflictError();
  }

  return {
    orderId: existing.id,
    orderNumber: existing.number,
    order: existing,
    notificationJobs: existing.notificationJobs,
    reused: true,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  if (input.idempotencyKey && !input.requestHash) {
    throw new Error('requestHash is required when idempotencyKey is provided.');
  }

  const existing = await findOrderByIdempotency(input);
  if (existing) return existing;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const orderNumber = generateOrderNumber();
    const notificationJobs = input.buildNotificationJobs?.(orderNumber) ?? [];

    try {
      const order = await prisma.order.create({
        data: {
          number: orderNumber,
          source: input.source,
          status: 'new',
          customerName: input.customerName ?? null,
          phone: input.phone ?? null,
          email: input.email ?? null,
          comment: input.comment ?? null,
          total: Math.max(0, Math.round(Number(input.total) || 0)),
          prepayRequired: input.prepayRequired ?? false,
          prepayAmount: input.prepayAmount ?? null,
          paymentStatus: 'unpaid',
          payloadJson: input.payloadJson,
          quoteJson: input.quoteJson,
          idempotencyKey: input.idempotencyKey ?? null,
          requestHash: input.requestHash ?? null,
          ...(notificationJobs.length > 0 ? {
            notificationJobs: {
              create: notificationJobs.map((job) => ({
                kind: job.kind,
                dedupeKey: `${orderNumber}:${job.dedupeSuffix}`,
                payloadJson: job.payloadJson,
                maxAttempts: job.maxAttempts ?? 8,
              })),
            },
          } : {}),
        },
        include: { notificationJobs: true },
      });

      return {
        orderId: order.id,
        orderNumber: order.number,
        order,
        notificationJobs: order.notificationJobs,
        reused: false,
      };
    } catch (error) {
      if (!isUniqueCollision(error)) throw error;

      const racedOrder = await findOrderByIdempotency(input);
      if (racedOrder) return racedOrder;
      if (attempt === 9) throw error;
    }
  }

  throw new Error('Failed to create unique order number after 10 collision retries.');
}

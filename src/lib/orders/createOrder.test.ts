import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IdempotencyConflictError } from '@/lib/orders/idempotency';

const { orderCreateMock, orderFindUniqueMock } = vi.hoisted(() => ({
  orderCreateMock: vi.fn(),
  orderFindUniqueMock: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    order: {
      create: orderCreateMock,
      findUnique: orderFindUniqueMock,
    },
  },
}));

vi.mock('@/lib/orders/generateOrderNumber', () => ({
  generateOrderNumber: () => 'ORDER-123',
}));

function orderRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    number: 'ORDER-123',
    source: 'lead',
    status: 'new',
    customerName: 'Иван',
    phone: '+79991234567',
    email: null,
    comment: null,
    managerNote: null,
    total: 0,
    prepayRequired: false,
    prepayAmount: null,
    paymentStatus: 'unpaid',
    paymentProvider: null,
    paymentRef: null,
    paidAmount: null,
    paidAt: null,
    payloadJson: {},
    quoteJson: {},
    idempotencyKey: 'lead:key-1234',
    requestHash: 'hash-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    notificationJobs: [],
    ...overrides,
  };
}

describe('createOrder', () => {
  beforeEach(() => {
    orderCreateMock.mockReset();
    orderFindUniqueMock.mockReset();
  });

  it('returns the existing order for the same key and request hash', async () => {
    orderFindUniqueMock.mockResolvedValue(orderRecord());
    const { createOrder } = await import('@/lib/orders/createOrder');

    const result = await createOrder({
      source: 'lead',
      total: 0,
      payloadJson: {},
      quoteJson: {},
      idempotencyKey: 'lead:key-1234',
      requestHash: 'hash-1',
    });

    expect(result.reused).toBe(true);
    expect(result.orderNumber).toBe('ORDER-123');
    expect(orderCreateMock).not.toHaveBeenCalled();
  });

  it('rejects reuse of a key with a different request hash', async () => {
    orderFindUniqueMock.mockResolvedValue(orderRecord());
    const { createOrder } = await import('@/lib/orders/createOrder');

    await expect(createOrder({
      source: 'lead',
      total: 0,
      payloadJson: {},
      quoteJson: {},
      idempotencyKey: 'lead:key-1234',
      requestHash: 'hash-2',
    })).rejects.toBeInstanceOf(IdempotencyConflictError);
  });

  it('creates the order and notification jobs in one nested write', async () => {
    orderFindUniqueMock.mockResolvedValue(null);
    orderCreateMock.mockImplementation(async ({ data }) => orderRecord({
      ...data,
      notificationJobs: [{ id: 'job-1' }],
    }));
    const { createOrder } = await import('@/lib/orders/createOrder');

    const result = await createOrder({
      source: 'lead',
      total: 0,
      payloadJson: {},
      quoteJson: {},
      idempotencyKey: 'lead:key-1234',
      requestHash: 'hash-1',
      buildNotificationJobs: () => [{
        kind: 'telegram.text',
        dedupeSuffix: 'manager-telegram',
        payloadJson: { text: 'New lead' },
      }],
    });

    expect(result.reused).toBe(false);
    expect(orderCreateMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        idempotencyKey: 'lead:key-1234',
        requestHash: 'hash-1',
        notificationJobs: {
          create: [expect.objectContaining({
            dedupeKey: 'ORDER-123:manager-telegram',
            kind: 'telegram.text',
          })],
        },
      }),
      include: { notificationJobs: true },
    }));
  });
});

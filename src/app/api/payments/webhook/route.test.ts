import { createHash, createHmac } from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const findUniqueMock = vi.fn();
const updateMock = vi.fn();
const createWebhookEventMock = vi.fn();
const updateWebhookEventMock = vi.fn();

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    PAYMENT_WEBHOOK_SECRET: 'webhook-secret',
  }),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback({
      order: {
        findUnique: findUniqueMock,
        update: updateMock,
      },
      paymentWebhookEvent: {
        create: createWebhookEventMock,
        update: updateWebhookEventMock,
      },
    })),
  },
}));

function signPayload(payload: string): string {
  return createHmac('sha256', 'webhook-secret').update(payload).digest('hex');
}

describe('POST /api/payments/webhook security', () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
    createWebhookEventMock.mockReset();
    updateWebhookEventMock.mockReset();
  });

  it('still requires signature header', async () => {
    const { POST } = await import('@/app/api/payments/webhook/route');
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderNumber: 'ORDER1', status: 'paid' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('marks order paid for valid signed webhook', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'order-id',
      total: 10000,
      prepayRequired: false,
      prepayAmount: null,
      paymentStatus: 'pending',
    });
    createWebhookEventMock.mockResolvedValue({ id: 'evt-row' });
    updateWebhookEventMock.mockResolvedValue({});
    updateMock.mockResolvedValue({});

    const { POST } = await import('@/app/api/payments/webhook/route');
    const body = JSON.stringify({ orderNumber: 'ORDER1', status: 'paid', eventId: 'evt_1' });
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': signPayload(body),
      },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(createWebhookEventMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        provider: 'mock',
        eventId: 'evt_1',
        orderNumber: 'ORDER1',
        status: 'paid',
      }),
    }));
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'order-id' },
      data: expect.objectContaining({ paymentStatus: 'paid', paidAmount: 10000 }),
    }));
  });

  it('rejects paid webhook when provided amount mismatches expected order amount', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'order-id',
      total: 10000,
      prepayRequired: false,
      prepayAmount: null,
      paymentStatus: 'pending',
    });
    createWebhookEventMock.mockResolvedValue({ id: 'evt-row' });

    const { POST } = await import('@/app/api/payments/webhook/route');
    const body = JSON.stringify({ orderNumber: 'ORDER1', status: 'paid', eventId: 'evt_bad_amount', paidAmount: 9000 });
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': signPayload(body),
      },
      body,
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual(expect.objectContaining({ ok: false }));
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('accepts paid webhook when provided amount matches expected order amount', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'order-id',
      total: 10000,
      prepayRequired: false,
      prepayAmount: null,
      paymentStatus: 'pending',
    });
    createWebhookEventMock.mockResolvedValue({ id: 'evt-row' });
    updateWebhookEventMock.mockResolvedValue({});
    updateMock.mockResolvedValue({});

    const { POST } = await import('@/app/api/payments/webhook/route');
    const body = JSON.stringify({ orderNumber: 'ORDER1', status: 'paid', eventId: 'evt_good_amount', paidAmount: 10000 });
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': signPayload(body),
      },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'order-id' },
      data: expect.objectContaining({ paymentStatus: 'paid', paidAmount: 10000 }),
    }));
  });

  it('uses deterministic event id when payload omits eventId', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'order-id',
      total: 5000,
      prepayRequired: false,
      prepayAmount: null,
      paymentStatus: 'pending',
    });
    createWebhookEventMock.mockResolvedValue({ id: 'evt-row' });
    updateWebhookEventMock.mockResolvedValue({});
    updateMock.mockResolvedValue({});

    const { POST } = await import('@/app/api/payments/webhook/route');
    const body = JSON.stringify({ orderNumber: 'ORDER1', status: 'paid' });
    const expectedEventId = createHash('sha256').update(body).digest('hex');
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': signPayload(body),
      },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(createWebhookEventMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ eventId: expectedEventId }),
    }));
  });

  it('ignores duplicate signed event idempotently', async () => {
    createWebhookEventMock.mockRejectedValue({ code: 'P2002' });

    const { POST } = await import('@/app/api/payments/webhook/route');
    const body = JSON.stringify({ orderNumber: 'ORDER1', status: 'paid', eventId: 'evt_dup' });
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': signPayload(body),
      },
      body,
    });

    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(expect.objectContaining({ ok: true, duplicate: true }));
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('does not downgrade paid order on failed event', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'order-id',
      total: 10000,
      prepayRequired: false,
      prepayAmount: null,
      paymentStatus: 'paid',
    });
    createWebhookEventMock.mockResolvedValue({ id: 'evt-row' });
    updateWebhookEventMock.mockResolvedValue({});

    const { POST } = await import('@/app/api/payments/webhook/route');
    const body = JSON.stringify({ orderNumber: 'ORDER1', status: 'failed', eventId: 'evt_failed' });
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': signPayload(body),
      },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(updateMock).not.toHaveBeenCalled();
    expect(updateWebhookEventMock).toHaveBeenCalled();
  });

  it('rejects invalid signature', async () => {
    const { POST } = await import('@/app/api/payments/webhook/route');
    const body = JSON.stringify({ orderNumber: 'ORDER1', status: 'paid', eventId: 'evt_sig' });
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': 'bad-signature',
      },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('rejects unknown order numbers safely', async () => {
    findUniqueMock.mockResolvedValue(null);
    createWebhookEventMock.mockResolvedValue({ id: 'evt-row' });

    const { POST } = await import('@/app/api/payments/webhook/route');
    const body = JSON.stringify({ orderNumber: 'UNKNOWN', status: 'paid', eventId: 'evt_unknown' });
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': signPayload(body),
      },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(updateMock).not.toHaveBeenCalled();
  });
});

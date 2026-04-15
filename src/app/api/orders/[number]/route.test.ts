import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const findUniqueMock = vi.fn();

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    ADMIN_TOKEN: 'admin-token',
    ORDER_TOKEN_SECRET: 'order-secret',
  }),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    order: {
      findUnique: findUniqueMock,
    },
  },
}));

vi.mock('@/lib/orders/access', () => ({
  hasValidOrderAccessToken: vi.fn(({ token }: { token?: string | null }) => token === 'valid-token'),
  isAdminAuthorized: vi.fn((request: NextRequest) => request.headers.get('authorization') === 'Bearer admin-token'),
}));

vi.mock('@/lib/orders/pdfAccessToken', () => ({
  createOrderAccessToken: vi.fn(() => 'generated-token'),
}));

vi.mock('@/lib/url/getBaseUrl', () => ({
  getBaseUrl: () => 'http://localhost:3000',
}));

describe('GET /api/orders/[number]', () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
  });

  it('denies request without token and without admin auth', async () => {
    const { GET } = await import('@/app/api/orders/[number]/route');
    const request = new NextRequest('http://localhost:3000/api/orders/ORDER12345');

    const response = await GET(request, { params: { number: 'ORDER12345' } });

    expect(response.status).toBe(403);
  });

  it('returns minimized customer-safe response for token access', async () => {
    findUniqueMock.mockResolvedValue({
      number: 'ORDER12345',
      status: 'new',
      createdAt: new Date('2026-04-15T10:00:00.000Z'),
      customerName: 'Иван',
      phone: '+79001234567',
      email: 'ivan@example.com',
      comment: 'Комментарий',
      total: 10000,
      prepayRequired: true,
      prepayAmount: 5000,
      paymentStatus: 'pending',
      paymentProvider: 'mock-pay',
      paymentRef: 'pay-ref-1',
      paidAmount: null,
      paidAt: null,
      quoteJson: {
        effectiveSize: { width: 2000, height: 3000 },
        items: [{ title: 'Печать', total: 10000, internalMeta: { hidden: true } }],
        rawGatewayPayload: { secret: 'should-not-leak' },
      },
    });

    const { GET } = await import('@/app/api/orders/[number]/route');
    const request = new NextRequest('http://localhost:3000/api/orders/ORDER12345?token=valid-token');
    const response = await GET(request, { params: { number: 'ORDER12345' } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      number: 'ORDER12345',
      customerName: 'Иван',
      phone: '+79001234567',
      email: 'ivan@example.com',
      comment: 'Комментарий',
      total: 10000,
      prepayRequired: true,
      prepayAmount: 5000,
      paymentStatus: 'pending',
      quoteJson: {
        effectiveSize: { width: 2000, height: 3000 },
        items: [{ title: 'Печать', total: 10000 }],
      },
      accessToken: 'valid-token',
    });
    expect(json).not.toHaveProperty('status');
    expect(json).not.toHaveProperty('paymentProvider');
    expect(json).not.toHaveProperty('paymentRef');
    expect(json.quoteJson).not.toHaveProperty('rawGatewayPayload');
    expect(json.quoteJson.items[0]).not.toHaveProperty('internalMeta');
  });

  it('keeps full response for admin bearer access', async () => {
    findUniqueMock.mockResolvedValue({
      number: 'ORDER12345',
      status: 'new',
      createdAt: new Date('2026-04-15T10:00:00.000Z'),
      customerName: 'Иван',
      phone: '+79001234567',
      email: 'ivan@example.com',
      comment: 'Комментарий',
      total: 10000,
      prepayRequired: false,
      prepayAmount: null,
      paymentStatus: 'paid',
      paymentProvider: 'mock-pay',
      paymentRef: 'pay-ref-1',
      paidAmount: 10000,
      paidAt: new Date('2026-04-15T11:00:00.000Z'),
      quoteJson: { rawGatewayPayload: { secret: 'visible-to-admin' } },
    });

    const { GET } = await import('@/app/api/orders/[number]/route');
    const request = new NextRequest('http://localhost:3000/api/orders/ORDER12345', {
      headers: { authorization: 'Bearer admin-token' },
    });
    const response = await GET(request, { params: { number: 'ORDER12345' } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      number: 'ORDER12345',
      status: 'new',
      paymentProvider: 'mock-pay',
      paymentRef: 'pay-ref-1',
      quoteJson: { rawGatewayPayload: { secret: 'visible-to-admin' } },
    });
  });
});

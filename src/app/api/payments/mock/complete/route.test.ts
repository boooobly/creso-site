import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createOrderAccessToken } from '@/lib/orders/pdfAccessToken';

const findUniqueMock = vi.fn();
const updateMock = vi.fn();

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
      update: updateMock,
    },
  },
}));

describe('POST /api/payments/mock/complete', () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it('updates order to paid for valid mock payment ref', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'order-id',
      number: 'ORDER1',
      total: 12000,
      prepayRequired: true,
      prepayAmount: 6000,
      paymentProvider: 'mock',
      paymentRef: 'pay_ref',
    });
    updateMock.mockResolvedValue({});

    const { POST } = await import('@/app/api/payments/mock/complete/route');
    const token = createOrderAccessToken('ORDER1', 'order-secret');
    const request = new NextRequest('http://localhost:3000/api/payments/mock/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderNumber: 'ORDER1', paymentRef: 'pay_ref', status: 'paid', token }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'order-id' },
      data: expect.objectContaining({ paymentStatus: 'paid', paidAmount: 6000 }),
    }));
  });

  it('updates order to failed for valid mock payment ref', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'order-id',
      number: 'ORDER1',
      total: 12000,
      prepayRequired: false,
      prepayAmount: null,
      paymentProvider: 'mock',
      paymentRef: 'pay_ref',
    });
    updateMock.mockResolvedValue({});

    const { POST } = await import('@/app/api/payments/mock/complete/route');
    const token = createOrderAccessToken('ORDER1', 'order-secret');
    const request = new NextRequest('http://localhost:3000/api/payments/mock/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderNumber: 'ORDER1', paymentRef: 'pay_ref', status: 'failed', token }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'order-id' },
      data: expect.objectContaining({ paymentStatus: 'failed', paidAmount: null, paidAt: null }),
    }));
  });

  it('rejects invalid paymentRef', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'order-id',
      number: 'ORDER1',
      total: 12000,
      prepayRequired: false,
      prepayAmount: null,
      paymentProvider: 'mock',
      paymentRef: 'pay_real',
    });

    const { POST } = await import('@/app/api/payments/mock/complete/route');
    const token = createOrderAccessToken('ORDER1', 'order-secret');
    const request = new NextRequest('http://localhost:3000/api/payments/mock/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderNumber: 'ORDER1', paymentRef: 'pay_fake', status: 'paid', token }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });
});

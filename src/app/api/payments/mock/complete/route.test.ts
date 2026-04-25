import { describe, expect, it } from 'vitest';

import { NextRequest } from 'next/server';

describe('POST /api/payments/mock/complete', () => {
  it('returns 410 when online payment is disabled', async () => {
    const { POST } = await import('@/app/api/payments/mock/complete/route');
    const request = new NextRequest('http://localhost:3000/api/payments/mock/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderNumber: 'ORDER1', paymentRef: 'pay_ref', status: 'paid', token: 'token' }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json).toEqual({ ok: false, error: 'Онлайн-оплата на сайте отключена.' });
  });
});

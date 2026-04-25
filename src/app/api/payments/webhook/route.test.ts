import { describe, expect, it } from 'vitest';

import { NextRequest } from 'next/server';

describe('POST /api/payments/webhook', () => {
  it('returns 410 when online payment is disabled', async () => {
    const { POST } = await import('@/app/api/payments/webhook/route');
    const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': 'ignored-while-disabled',
      },
      body: JSON.stringify({ orderNumber: 'ORDER1', status: 'paid', eventId: 'evt_1' }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json).toEqual({ ok: false, error: 'Онлайн-оплата на сайте отключена.' });
  });
});

import { describe, expect, it } from 'vitest';

import { NextRequest } from 'next/server';

describe('POST /api/payments/create', () => {
  it('returns 410 when online payment is disabled', async () => {
    const { POST } = await import('@/app/api/payments/create/route');
    const request = new NextRequest('http://localhost:3000/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ orderNumber: 'ORDER12345' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json).toEqual({ ok: false, error: 'Онлайн-оплата на сайте отключена.' });
  });
});

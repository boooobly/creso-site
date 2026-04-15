import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

describe('POST /api/lead', () => {
  it('blocks honeypot payload', async () => {
    const { POST } = await import('@/app/api/lead/route');

    const request = new NextRequest('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.61',
      },
      body: JSON.stringify({
        name: 'Иван',
        email: 'ivan@example.com',
        phone: '+79991234567',
        service: 'Широкоформатная печать',
        consent: true,
        website: 'spam.example',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('accepts valid payload', async () => {
    const { POST } = await import('@/app/api/lead/route');

    const request = new NextRequest('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.62',
      },
      body: JSON.stringify({
        name: 'Иван',
        email: 'ivan@example.com',
        phone: '+79991234567',
        service: 'Широкоформатная печать',
        message: 'Нужен расчёт',
        consent: true,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, calculationDetails: undefined });
  });
});

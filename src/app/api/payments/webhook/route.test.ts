import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    PAYMENT_WEBHOOK_SECRET: 'webhook-secret',
  }),
}));

describe('POST /api/payments/webhook security', () => {
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
});

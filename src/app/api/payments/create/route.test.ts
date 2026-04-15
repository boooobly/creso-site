import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    ADMIN_TOKEN: 'admin-token',
    ORDER_TOKEN_SECRET: 'order-secret',
  }),
}));

describe('POST /api/payments/create', () => {
  it('denies request without token and without admin auth', async () => {
    const { POST } = await import('@/app/api/payments/create/route');
    const request = new NextRequest('http://localhost:3000/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ orderNumber: 'ORDER12345' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });
});

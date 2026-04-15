import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/env', () => ({
  getServerEnv: () => ({
    ADMIN_TOKEN: 'admin-token',
    ORDER_TOKEN_SECRET: 'order-secret',
  }),
}));

describe('GET /api/orders/[number]', () => {
  it('denies request without token and without admin auth', async () => {
    const { GET } = await import('@/app/api/orders/[number]/route');
    const request = new NextRequest('http://localhost:3000/api/orders/ORDER12345');

    const response = await GET(request, { params: { number: 'ORDER12345' } });

    expect(response.status).toBe(403);
  });
});

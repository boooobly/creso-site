import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('POST /api/orders security guards', () => {
  it('rejects requests without a user-agent before processing an order', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.91',
      },
      body: JSON.stringify({ customer: { name: 'Test' } }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('rejects oversized JSON before parsing it', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': String(300 * 1024),
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.92',
      },
      body: '{}',
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
  });

  it('enforces the JSON limit when content-length is absent', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.94',
      },
      body: JSON.stringify({ comment: 'x'.repeat(300 * 1024) }),
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
  });

  it('blocks the order honeypot before business validation', async () => {
    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.93',
      },
      body: JSON.stringify({ company: 'spam.example' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});

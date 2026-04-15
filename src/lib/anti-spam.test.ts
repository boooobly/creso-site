import { describe, expect, it } from 'vitest';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';

describe('enforcePublicRequestGuard', () => {
  it('blocks requests without user-agent header', () => {
    const request = new Request('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '203.0.113.10',
      },
      body: JSON.stringify({ name: 'Иван' }),
    });

    const response = enforcePublicRequestGuard(request, {
      route: '/api/lead',
      payload: { name: 'Иван' },
      requirePayload: true,
    });

    expect(response?.status).toBe(400);
  });

  it('blocks honeypot payloads', () => {
    const request = new Request('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'user-agent': 'Vitest',
        'x-forwarded-for': '203.0.113.11',
      },
      body: JSON.stringify({ website: 'spam' }),
    });

    const response = enforcePublicRequestGuard(request, {
      route: '/api/lead',
      payload: { website: 'spam' },
      honeypotFields: ['website'],
      requirePayload: true,
    });

    expect(response?.status).toBe(400);
  });

  it('rate limits repeated requests from the same ip', () => {
    const ip = '203.0.113.12';
    const makeRequest = () =>
      new Request('http://localhost:3000/api/lead', {
        method: 'POST',
        headers: {
          'user-agent': 'Vitest',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify({ name: 'Иван' }),
      });

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = enforcePublicRequestGuard(makeRequest(), {
        route: '/api/lead',
        payload: { name: 'Иван' },
        requirePayload: true,
      });
      expect(response).toBeNull();
    }

    const blocked = enforcePublicRequestGuard(makeRequest(), {
      route: '/api/lead',
      payload: { name: 'Иван' },
      requirePayload: true,
    });
    expect(blocked?.status).toBe(429);
  });
});

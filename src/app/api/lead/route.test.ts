import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const canonicalPostMock = vi.fn(async () => NextResponse.json({ ok: true }));

vi.mock('@/app/api/leads/route', () => ({
  POST: canonicalPostMock,
}));

describe('POST /api/lead (legacy wrapper)', () => {
  beforeEach(() => {
    canonicalPostMock.mockClear();
  });

  it('forwards valid legacy payload into canonical /api/leads', async () => {
    const { POST } = await import('@/app/api/lead/route');

    const request = new NextRequest('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
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
    const forwardedRequest = canonicalPostMock.mock.calls[0]?.[0] as NextRequest;
    const forwardedJson = await forwardedRequest.json();

    expect(response.status).toBe(200);
    expect(canonicalPostMock).toHaveBeenCalledTimes(1);
    expect(forwardedJson).toEqual({
      source: 'legacy-lead-form',
      name: 'Иван',
      email: 'ivan@example.com',
      phone: '+79991234567',
      comment: 'Широкоформатная печать\nНужен расчёт',
    });
    expect(response.headers.get('x-creso-api-deprecated')).toBe('true');
    expect(response.headers.get('x-creso-api-canonical')).toBe('/api/leads');
  });

  it('returns 400 for invalid legacy payload', async () => {
    const { POST } = await import('@/app/api/lead/route');

    const request = new NextRequest('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Иван',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(canonicalPostMock).not.toHaveBeenCalled();
  });
});

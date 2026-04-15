import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const createMock = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    review: {
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

vi.mock('@/lib/reviews/hash', () => ({
  hashIp: () => 'hashed-ip',
}));

describe('POST /api/reviews', () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({ id: 'review_1' });
  });

  it('rate limits repeated submissions from same ip', async () => {
    const { POST } = await import('@/app/api/reviews/route');

    const headers = {
      'content-type': 'application/json',
      'user-agent': 'Vitest',
      'x-forwarded-for': '203.0.113.50',
    };
    const body = {
      isAnonymous: false,
      rating: 5,
      text: 'Очень хороший сервис и отличное качество печати!',
      website: '',
    };

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const request = new NextRequest('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    }

    const blockedRequest = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const blockedResponse = await POST(blockedRequest);
    expect(blockedResponse.status).toBe(429);
  });

  it('rejects requests without user-agent', async () => {
    const { POST } = await import('@/app/api/reviews/route');
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.51',
      },
      body: JSON.stringify({
        isAnonymous: true,
        rating: 4,
        text: 'Текст отзыва без ссылок и достаточной длины.',
        website: '',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});

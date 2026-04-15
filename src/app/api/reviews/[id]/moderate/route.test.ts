import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

describe('PATCH /api/reviews/[id]/moderate', () => {
  it('returns gone for deprecated legacy moderation route', async () => {
    const { PATCH } = await import('@/app/api/reviews/[id]/moderate/route');
    const request = new NextRequest('http://localhost:3000/api/reviews/review-1/moderate', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });

    const response = await PATCH(request, { params: { id: 'review-1' } });
    const json = await response.json();

    expect(response.status).toBe(410);
    expect(json.ok).toBe(false);
  });
});

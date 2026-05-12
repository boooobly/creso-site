import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

describe('GET /api/baget/image-proxy', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('rejects disallowed upstream hosts', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    const request = new NextRequest('http://localhost:3000/api/baget/image-proxy?url=https%3A%2F%2Fexample.com%2Fimage.jpg');

    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('proxies allowed image responses with cache headers', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'content-type': 'image/jpeg; charset=binary' },
    }));
    const imageUrl = encodeURIComponent('https://drive.google.com/uc?id=image-id');
    const request = new NextRequest(`http://localhost:3000/api/baget/image-proxy?url=${imageUrl}`);

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/jpeg');
    expect(response.headers.get('cache-control')).toBe('public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(fetchMock).toHaveBeenCalledWith(new URL('https://drive.google.com/uc?id=image-id'), {
      redirect: 'follow',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; CredomirImageProxy/1.0)',
      },
    });
  });

  it('rejects non-image upstream responses so the client can fall back', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(new Response('<html></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    }));
    const imageUrl = encodeURIComponent('https://lh3.googleusercontent.com/image-id');
    const request = new NextRequest(`http://localhost:3000/api/baget/image-proxy?url=${imageUrl}`);

    const response = await GET(request);

    expect(response.status).toBe(415);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const fetchMock = vi.fn();
const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

vi.stubGlobal('fetch', fetchMock);

function imageResponse(bytes = [1, 2, 3], contentType = 'image/jpeg; charset=binary', url?: string) {
  const response = new Response(new Uint8Array(bytes), {
    status: 200,
    headers: { 'content-type': contentType },
  });

  if (url) {
    Object.defineProperty(response, 'url', { value: url });
  }

  return response;
}

function requestFor(rawUrl: string, width?: string) {
  const url = new URL('http://localhost:3000/api/baget/image-proxy');
  url.searchParams.set('url', rawUrl);
  if (width) url.searchParams.set('width', width);

  return new NextRequest(url);
}

describe('GET /api/baget/image-proxy', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    warnMock.mockClear();
  });

  it('rejects disallowed upstream hosts', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    const response = await GET(requestFor('https://example.com/image.jpg'));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('tries the Google Drive thumbnail endpoint first for file URLs', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(imageResponse());

    const response = await GET(requestFor('https://drive.google.com/file/d/abc123/view?usp=sharing'));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].toString()).toBe('https://drive.google.com/thumbnail?id=abc123&sz=w900');
  });

  it('extracts Google Drive file IDs from uc URLs and tries the thumbnail endpoint first', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(imageResponse());

    const response = await GET(requestFor('https://drive.google.com/uc?export=view&id=abc123'));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].toString()).toBe('https://drive.google.com/thumbnail?id=abc123&sz=w900');
  });

  it('clamps requested widths before building the Google Drive thumbnail endpoint', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockImplementation(() => Promise.resolve(imageResponse()));

    await GET(requestFor('https://drive.google.com/open?id=too-small', '50'));
    await GET(requestFor('https://drive.google.com/open?id=too-large', '5000'));

    expect(fetchMock.mock.calls[0][0].toString()).toBe('https://drive.google.com/thumbnail?id=too-small&sz=w120');
    expect(fetchMock.mock.calls[1][0].toString()).toBe('https://drive.google.com/thumbnail?id=too-large&sz=w2000');
  });

  it('tries the next candidate when the first Google Drive response is not an image', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock
      .mockResolvedValueOnce(new Response('<html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }))
      .mockResolvedValueOnce(imageResponse([4, 5, 6], 'image/png'));

    const response = await GET(requestFor('https://drive.google.com/uc?export=view&id=abc123'));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([4, 5, 6]));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0].toString()).toBe('https://drive.usercontent.google.com/download?id=abc123&export=view');
  });

  it('allows googleusercontent redirect targets', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(imageResponse([7, 8, 9], 'image/webp', 'https://lh3.googleusercontent.com/proxy-image'));

    const response = await GET(requestFor('https://drive.google.com/open?id=abc123'));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/webp');
  });

  it('does not return images redirected to disallowed hosts', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock
      .mockResolvedValueOnce(imageResponse([1], 'image/jpeg', 'https://example.com/redirected.jpg'))
      .mockResolvedValueOnce(new Response('nope', { status: 404 }))
      .mockResolvedValueOnce(new Response('nope', { status: 404 }));

    const response = await GET(requestFor('https://drive.google.com/open?id=abc123'));

    expect(response.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('proxies allowed non-Google image responses with cache headers', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(imageResponse());

    const response = await GET(requestFor('https://images.ctfassets.net/space/image.jpg'));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/jpeg');
    expect(response.headers.get('cache-control')).toBe('public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(fetchMock).toHaveBeenCalledWith(new URL('https://images.ctfassets.net/space/image.jpg'), {
      redirect: 'follow',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; CredomirImageProxy/1.0)',
      },
    });
  });
});

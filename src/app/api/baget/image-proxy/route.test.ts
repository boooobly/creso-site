import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  buildUpstreamImageCandidates,
  clampProxyWidth,
  extractGoogleDriveFileId,
  isAllowedHostname,
  parseAllowedImageUrl,
} from './helpers';

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

describe('image proxy helpers', () => {
  it('extracts Google Drive file IDs from supported URL formats', () => {
    expect(extractGoogleDriveFileId(new URL('https://drive.google.com/file/d/abc123/view?usp=sharing'))).toBe('abc123');
    expect(extractGoogleDriveFileId(new URL('https://drive.google.com/open?id=abc123'))).toBe('abc123');
    expect(extractGoogleDriveFileId(new URL('https://drive.google.com/uc?id=abc123'))).toBe('abc123');
    expect(extractGoogleDriveFileId(new URL('https://drive.google.com/uc?export=view&id=abc123'))).toBe('abc123');
    expect(extractGoogleDriveFileId(new URL('https://docs.google.com/document/d/abc123/edit'))).toBe('abc123');
  });

  it('clamps proxy widths and builds Google Drive candidates in fallback order', () => {
    expect(clampProxyWidth(null)).toBe(900);
    expect(clampProxyWidth('50')).toBe(120);
    expect(clampProxyWidth('5000')).toBe(2000);

    expect(buildUpstreamImageCandidates(new URL('https://drive.google.com/uc?export=view&id=abc123'), 700).map(String)).toEqual([
      'https://drive.google.com/thumbnail?id=abc123&sz=w700',
      'https://drive.usercontent.google.com/download?id=abc123&export=view',
      'https://drive.google.com/uc?export=view&id=abc123',
    ]);
  });

  it('parses only allowlisted HTTPS image hosts', () => {
    expect(isAllowedHostname('lh3.googleusercontent.com')).toBe(true);
    expect(parseAllowedImageUrl('https://images.ctfassets.net/space/image.jpg')?.hostname).toBe('images.ctfassets.net');
    expect(parseAllowedImageUrl('https://example.com/image.jpg')).toBeNull();
    expect(parseAllowedImageUrl('http://drive.google.com/uc?id=abc123')).toBeNull();
    expect(parseAllowedImageUrl('https://user:pass@drive.google.com/uc?id=abc123')).toBeNull();
    expect(parseAllowedImageUrl('https://drive.google.com:8443/uc?id=abc123')).toBeNull();
  });
});

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
      redirect: 'manual',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/png,image/jpeg,image/gif,*/*;q=0.1',
        'User-Agent': 'Mozilla/5.0 (compatible; CredomirImageProxy/1.0)',
      },
      signal: expect.any(AbortSignal),
    });
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('rejects SVG responses even from allowed hosts', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(imageResponse([1, 2, 3], 'image/svg+xml'));

    const response = await GET(requestFor('https://images.ctfassets.net/space/image.svg'));

    expect(response.status).toBe(502);
  });

  it('rejects images whose declared size exceeds the proxy limit', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(new Response(new Uint8Array([1]), {
      status: 200,
      headers: {
        'content-type': 'image/jpeg',
        'content-length': String(11 * 1024 * 1024),
      },
    }));

    const response = await GET(requestFor('https://images.ctfassets.net/space/large.jpg'));

    expect(response.status).toBe(502);
  });

  it('does not follow redirects to hosts outside the allowlist', async () => {
    const { GET } = await import('@/app/api/baget/image-proxy/route');
    fetchMock.mockResolvedValueOnce(new Response(null, {
      status: 302,
      headers: { location: 'https://example.com/private.jpg' },
    }));

    const response = await GET(requestFor('https://images.ctfassets.net/space/image.jpg'));

    expect(response.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

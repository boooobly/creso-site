import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_IMAGE_WIDTH = 900;
const MIN_IMAGE_WIDTH = 120;
const MAX_IMAGE_WIDTH = 2000;
const IMAGE_CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800';
const IMAGE_PROXY_FETCH_HEADERS = {
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'User-Agent': 'Mozilla/5.0 (compatible; CredomirImageProxy/1.0)',
};

function isAllowedHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();

  if (
    normalizedHostname === 'drive.google.com'
    || normalizedHostname === 'docs.google.com'
    || normalizedHostname === 'lh3.googleusercontent.com'
    || normalizedHostname === 'googleusercontent.com'
    || normalizedHostname === 'images.ctfassets.net'
    || normalizedHostname === 'assets.ctfassets.net'
  ) {
    return true;
  }

  return normalizedHostname.endsWith('.googleusercontent.com')
    || normalizedHostname.endsWith('.public.blob.vercel-storage.com');
}

function isGoogleDriveHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();
  return normalizedHostname === 'drive.google.com' || normalizedHostname === 'docs.google.com';
}

function parseAllowedImageUrl(rawUrl: string | null): URL | null {
  if (!rawUrl || rawUrl.startsWith('/')) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') {
      return null;
    }

    if (!isAllowedHostname(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function clampImageWidth(rawWidth: string | null): number {
  const parsedWidth = Number.parseInt(rawWidth ?? '', 10);
  if (!Number.isFinite(parsedWidth)) return DEFAULT_IMAGE_WIDTH;

  return Math.min(MAX_IMAGE_WIDTH, Math.max(MIN_IMAGE_WIDTH, parsedWidth));
}

export function extractGoogleDriveFileId(url: URL): string | null {
  if (!isGoogleDriveHostname(url.hostname)) return null;

  const idParam = url.searchParams.get('id');
  if (idParam) return idParam;

  const pathParts = url.pathname.split('/').filter(Boolean);
  const dIndex = pathParts.indexOf('d');
  if (dIndex >= 0 && pathParts[dIndex + 1]) {
    return pathParts[dIndex + 1];
  }

  return null;
}

function getUpstreamCandidates(originalUrl: URL, width: number): URL[] {
  const googleDriveFileId = extractGoogleDriveFileId(originalUrl);
  if (!googleDriveFileId) return [originalUrl];

  return [
    new URL(`https://drive.google.com/thumbnail?id=${encodeURIComponent(googleDriveFileId)}&sz=w${width}`),
    new URL(`https://drive.usercontent.google.com/download?id=${encodeURIComponent(googleDriveFileId)}&export=view`),
    originalUrl,
  ];
}

function warnImageProxyDiagnostic(originalUrl: URL, candidateUrl: URL, response?: Response) {
  if (process.env.NODE_ENV === 'production') return;

  console.warn('[baget-image-proxy]', {
    originalHost: originalUrl.hostname,
    candidateHost: candidateUrl.hostname,
    status: response?.status,
    contentType: response?.headers.get('content-type') ?? null,
  });
}

export async function GET(request: NextRequest) {
  const imageUrl = parseAllowedImageUrl(request.nextUrl.searchParams.get('url'));

  if (!imageUrl) {
    return NextResponse.json({ ok: false, error: 'Invalid image URL.' }, { status: 400 });
  }

  const width = clampImageWidth(request.nextUrl.searchParams.get('width'));
  const upstreamCandidates = getUpstreamCandidates(imageUrl, width);

  for (const candidateUrl of upstreamCandidates) {
    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(candidateUrl, {
        redirect: 'follow',
        headers: IMAGE_PROXY_FETCH_HEADERS,
      });
    } catch {
      warnImageProxyDiagnostic(imageUrl, candidateUrl);
      continue;
    }

    warnImageProxyDiagnostic(imageUrl, candidateUrl, upstreamResponse);

    if (!upstreamResponse.ok) {
      continue;
    }

    if (upstreamResponse.url) {
      const responseUrl = new URL(upstreamResponse.url);
      if (responseUrl.hostname.toLowerCase() !== candidateUrl.hostname.toLowerCase() && !parseAllowedImageUrl(upstreamResponse.url)) {
        continue;
      }
    }

    const contentType = upstreamResponse.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? '';
    if (!contentType.startsWith('image/')) {
      continue;
    }

    const imageBytes = await upstreamResponse.arrayBuffer();

    return new NextResponse(imageBytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': IMAGE_CACHE_CONTROL,
      },
    });
  }

  return NextResponse.json({ ok: false, error: 'Image fetch failed.' }, { status: 502 });
}

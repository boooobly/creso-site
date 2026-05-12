import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const IMAGE_CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800';

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

export async function GET(request: NextRequest) {
  const imageUrl = parseAllowedImageUrl(request.nextUrl.searchParams.get('url'));

  if (!imageUrl) {
    return NextResponse.json({ ok: false, error: 'Invalid image URL.' }, { status: 400 });
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(imageUrl, { redirect: 'follow' });
  } catch {
    return NextResponse.json({ ok: false, error: 'Image fetch failed.' }, { status: 502 });
  }

  if (!upstreamResponse.ok) {
    return NextResponse.json({ ok: false, error: 'Image fetch failed.' }, { status: 502 });
  }

  if (upstreamResponse.url && !parseAllowedImageUrl(upstreamResponse.url)) {
    return NextResponse.json({ ok: false, error: 'Redirected image URL is not allowed.' }, { status: 400 });
  }

  const contentType = upstreamResponse.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!contentType.startsWith('image/')) {
    return NextResponse.json({ ok: false, error: 'Upstream response is not an image.' }, { status: 415 });
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

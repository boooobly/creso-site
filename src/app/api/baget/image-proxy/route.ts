import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamImageCandidates,
  clampProxyWidth,
  IMAGE_CACHE_CONTROL,
  IMAGE_PROXY_FETCH_HEADERS,
  parseAllowedImageUrl,
} from './helpers';

export const runtime = 'nodejs';

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

  const width = clampProxyWidth(request.nextUrl.searchParams.get('width'));
  const upstreamCandidates = buildUpstreamImageCandidates(imageUrl, width);

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

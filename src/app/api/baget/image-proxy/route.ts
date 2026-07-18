import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamImageCandidates,
  clampProxyWidth,
  IMAGE_CACHE_CONTROL,
  IMAGE_PROXY_FETCH_HEADERS,
  parseAllowedImageUrl,
} from './helpers';

export const runtime = 'nodejs';

const IMAGE_PROXY_TIMEOUT_MS = 8_000;
const IMAGE_PROXY_MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_PROXY_MAX_REDIRECTS = 3;
const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/apng',
]);

function warnImageProxyDiagnostic(originalUrl: URL, candidateUrl: URL, response?: Response) {
  if (process.env.NODE_ENV === 'production') return;

  console.warn('[baget-image-proxy]', {
    originalHost: originalUrl.hostname,
    candidateHost: candidateUrl.hostname,
    status: response?.status,
    contentType: response?.headers.get('content-type') ?? null,
  });
}

async function fetchAllowedImage(initialUrl: URL): Promise<Response | null> {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= IMAGE_PROXY_MAX_REDIRECTS; redirectCount += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_PROXY_TIMEOUT_MS);
    let response: Response;

    try {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        headers: IMAGE_PROXY_FETCH_HEADERS,
        signal: controller.signal,
      });
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || redirectCount === IMAGE_PROXY_MAX_REDIRECTS) return null;

      let redirectedUrl: URL | null;
      try {
        redirectedUrl = parseAllowedImageUrl(new URL(location, currentUrl).href);
      } catch {
        return null;
      }
      if (!redirectedUrl) return null;

      currentUrl = redirectedUrl;
      continue;
    }

    if (response.url && !parseAllowedImageUrl(response.url)) {
      return null;
    }

    return response;
  }

  return null;
}

async function readImageBytes(response: Response): Promise<Uint8Array | null> {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > IMAGE_PROXY_MAX_BYTES) {
    return null;
  }

  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    return bytes.byteLength <= IMAGE_PROXY_MAX_BYTES ? bytes : null;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    void reader.cancel();
  }, IMAGE_PROXY_TIMEOUT_MS);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > IMAGE_PROXY_MAX_BYTES) {
        await reader.cancel();
        return null;
      }

      chunks.push(value);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (timedOut) return null;

  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return result;
}

export async function GET(request: NextRequest) {
  const imageUrl = parseAllowedImageUrl(request.nextUrl.searchParams.get('url'));

  if (!imageUrl) {
    return NextResponse.json({ ok: false, error: 'Invalid image URL.' }, { status: 400 });
  }

  const width = clampProxyWidth(request.nextUrl.searchParams.get('width'));
  const upstreamCandidates = buildUpstreamImageCandidates(imageUrl, width);

  for (const candidateUrl of upstreamCandidates) {
    const upstreamResponse = await fetchAllowedImage(candidateUrl);
    if (!upstreamResponse) {
      warnImageProxyDiagnostic(imageUrl, candidateUrl);
      continue;
    }

    warnImageProxyDiagnostic(imageUrl, candidateUrl, upstreamResponse);

    if (!upstreamResponse.ok) {
      continue;
    }

    const contentType = upstreamResponse.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? '';
    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(contentType)) {
      continue;
    }

    const imageBytes = await readImageBytes(upstreamResponse).catch(() => null);
    if (!imageBytes) {
      continue;
    }

    const responseBody = imageBytes.buffer.slice(
      imageBytes.byteOffset,
      imageBytes.byteOffset + imageBytes.byteLength,
    ) as ArrayBuffer;

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': IMAGE_CACHE_CONTROL,
        'Content-Security-Policy': "default-src 'none'; sandbox",
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  return NextResponse.json({ ok: false, error: 'Image fetch failed.' }, { status: 502 });
}

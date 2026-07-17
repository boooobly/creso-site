export const DEFAULT_PROXY_WIDTH = 900;
export const MIN_PROXY_WIDTH = 120;
export const MAX_PROXY_WIDTH = 2000;
export const IMAGE_CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800';
export const IMAGE_PROXY_FETCH_HEADERS = {
  Accept: 'image/avif,image/webp,image/apng,image/png,image/jpeg,image/gif,*/*;q=0.1',
  'User-Agent': 'Mozilla/5.0 (compatible; CredomirImageProxy/1.0)',
};

export function isAllowedHostname(hostname: string): boolean {
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

export function parseAllowedImageUrl(rawUrl: string | null): URL | null {
  if (!rawUrl || rawUrl.startsWith('/')) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') {
      return null;
    }

    if (url.username || url.password || (url.port && url.port !== '443')) {
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

export function clampProxyWidth(rawWidth: string | null): number {
  const parsedWidth = Number.parseInt(rawWidth ?? '', 10);
  if (!Number.isFinite(parsedWidth)) return DEFAULT_PROXY_WIDTH;

  return Math.min(MAX_PROXY_WIDTH, Math.max(MIN_PROXY_WIDTH, parsedWidth));
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

export function buildUpstreamImageCandidates(originalUrl: URL, width: number): URL[] {
  const googleDriveFileId = extractGoogleDriveFileId(originalUrl);
  if (!googleDriveFileId) return [originalUrl];

  return [
    new URL(`https://drive.google.com/thumbnail?id=${encodeURIComponent(googleDriveFileId)}&sz=w${width}`),
    new URL(`https://drive.usercontent.google.com/download?id=${encodeURIComponent(googleDriveFileId)}&export=view`),
    originalUrl,
  ];
}

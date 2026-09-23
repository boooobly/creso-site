import { getPublicEnv } from '@/lib/env';

const LOCALHOST_BASE_URL = 'http://localhost:3000';

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  const parsed = new URL(trimmed);

  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('[env] PUBLIC_BASE_URL must be an HTTP(S) origin without credentials.');
  }
  parsed.pathname = '/';
  parsed.search = '';
  parsed.hash = '';

  if (parsed.hostname === 'www.credomir.com') {
    parsed.hostname = 'credomir.com';
  }

  return parsed.toString().replace(/\/$/, '');
}

export function getBaseUrl(): string {
  const env = getPublicEnv();
  const fromEnv = env.PUBLIC_BASE_URL;
  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
  }

  const isNonProductionNodeEnv = env.NODE_ENV !== 'production';
  const isNonProductionVercelEnv = env.VERCEL_ENV === 'preview' || env.VERCEL_ENV === 'development';

  if (isNonProductionNodeEnv || isNonProductionVercelEnv) {
    return LOCALHOST_BASE_URL;
  }

  throw new Error('[env] Invalid environment configuration: PUBLIC_BASE_URL is required in production runtime/deploy.');
}

import { getPublicEnv } from '@/lib/env';

const LOCALHOST_BASE_URL = 'http://localhost:3000';

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  const parsed = new URL(trimmed);

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
  const isNonProductionVercelEnv = env.VERCEL_ENV !== 'production';

  if (isNonProductionNodeEnv || isNonProductionVercelEnv) {
    return LOCALHOST_BASE_URL;
  }

  throw new Error('[env] Invalid environment configuration: PUBLIC_BASE_URL is required in production runtime/deploy.');
}

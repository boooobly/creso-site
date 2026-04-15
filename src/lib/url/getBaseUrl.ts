import { getPublicEnv } from '@/lib/env';

const LOCALHOST_BASE_URL = 'http://localhost:3000';

export function getBaseUrl(): string {
  const env = getPublicEnv();
  const fromEnv = env.PUBLIC_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  const isNonProductionNodeEnv = env.NODE_ENV !== 'production';
  const isNonProductionVercelEnv = env.VERCEL_ENV !== 'production';

  if (isNonProductionNodeEnv || isNonProductionVercelEnv) {
    return LOCALHOST_BASE_URL;
  }

  throw new Error('[env] Invalid environment configuration: PUBLIC_BASE_URL is required in production runtime/deploy.');
}

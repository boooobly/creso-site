import { getPublicEnv } from '@/lib/env';

export function getBaseUrl(): string {
  const env = getPublicEnv();
  const fromEnv = env.PUBLIC_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  throw new Error('[env] Invalid environment configuration: PUBLIC_BASE_URL is required outside development.');
}

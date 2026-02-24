import { env } from '@/lib/env';

export function getBaseUrl(): string {
  const fromEnv = env.PUBLIC_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  throw new Error('[env] PUBLIC_BASE_URL is required outside development.');
}

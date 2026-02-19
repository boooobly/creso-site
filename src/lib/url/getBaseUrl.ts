import { env } from '@/lib/env';

export function getBaseUrl(): string {
  const fromEnv = env.PUBLIC_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  return env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'http://localhost:3000';
}

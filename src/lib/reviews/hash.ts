import { createHash } from 'node:crypto';

export function hashIp(ip: string): string | null {
  const normalized = ip.trim();
  if (!normalized || normalized === 'unknown') {
    return null;
  }

  return createHash('sha256').update(normalized).digest('hex');
}

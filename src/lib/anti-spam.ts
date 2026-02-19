import { getClientIp } from '@/lib/utils/request';

export { getClientIp };

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

type RateLimitRecord = {
  count: number;
  expiresAt: number;
};

const requestCounters = new Map<string, RateLimitRecord>();

export function hasUserAgent(request: Request): boolean {
  return Boolean(request.headers.get('user-agent')?.trim());
}

export function isEmptyPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return true;
  }

  return Object.keys(payload).length === 0;
}

export function isHoneypotTriggered(payload: unknown, fieldName: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return false;
  }

  const value = (payload as Record<string, unknown>)[fieldName];
  return typeof value === 'string' && value.trim().length > 0;
}

export function isRateLimited(ip: string, now = Date.now()): boolean {
  const current = requestCounters.get(ip);

  if (!current || current.expiresAt <= now) {
    requestCounters.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  current.count += 1;
  requestCounters.set(ip, current);
  return false;
}

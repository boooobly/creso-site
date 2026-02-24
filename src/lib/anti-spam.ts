import { isIpRateLimited } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/utils/request';

export { getClientIp };

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
  return isIpRateLimited(ip, now);
}

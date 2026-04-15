import { isIpRateLimited } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/utils/request';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export { getClientIp };

const GENERIC_REQUEST_ERROR = 'Ошибка обработки заявки.';
const RATE_LIMIT_ERROR = 'Слишком много запросов. Попробуйте позже.';
const EMPTY_PAYLOAD_ERROR = 'Не заполнены обязательные поля.';

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

type PublicRequestGuardOptions = {
  route: string;
  payload?: unknown;
  honeypotFields?: string[];
  requirePayload?: boolean;
};

export function enforcePublicRequestGuard(
  request: Request,
  options: PublicRequestGuardOptions,
): NextResponse | null {
  const clientIp = getClientIp(request);

  if (!hasUserAgent(request)) {
    logger.warn('public.request.blocked', { route: options.route, reason: 'missing_user_agent', ip: clientIp });
    return NextResponse.json({ ok: false, error: GENERIC_REQUEST_ERROR }, { status: 400 });
  }

  if (isRateLimited(clientIp)) {
    logger.warn('public.request.blocked', { route: options.route, reason: 'rate_limited', ip: clientIp });
    return NextResponse.json({ ok: false, error: RATE_LIMIT_ERROR }, { status: 429 });
  }

  if ((options.requirePayload ?? false) && isEmptyPayload(options.payload)) {
    logger.warn('public.request.blocked', { route: options.route, reason: 'empty_payload', ip: clientIp });
    return NextResponse.json({ ok: false, error: EMPTY_PAYLOAD_ERROR }, { status: 400 });
  }

  for (const field of options.honeypotFields ?? []) {
    if (isHoneypotTriggered(options.payload, field)) {
      logger.warn('public.request.blocked', { route: options.route, reason: 'honeypot_triggered', field, ip: clientIp });
      return NextResponse.json({ ok: false, error: GENERIC_REQUEST_ERROR }, { status: 400 });
    }
  }

  return null;
}

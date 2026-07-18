import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { processNotificationJobs } from '@/lib/notifications/outbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hashSecret(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function isAuthorized(request: NextRequest, expectedSecret: string): boolean {
  const authorization = request.headers.get('authorization') || '';
  const suppliedSecret = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  return timingSafeEqual(hashSecret(suppliedSecret), hashSecret(expectedSecret));
}

async function handleProcessRequest(request: NextRequest): Promise<NextResponse> {
  const cronSecret = getServerEnv().CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: 'Notification processor is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!isAuthorized(request, cronSecret)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const result = await processNotificationJobs({ limit: 20 });
    return NextResponse.json(
      { ok: true, ...result },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    logger.error('notifications.outbox.cron_failed', { error });
    return NextResponse.json(
      { ok: false, error: 'Notification processing failed.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

export const GET = handleProcessRequest;
export const POST = handleProcessRequest;

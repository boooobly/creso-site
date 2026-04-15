import { NextRequest, NextResponse } from 'next/server';
import { loadBagetCatalog } from '@/lib/baget/sheetsCatalog';
import { getServerEnv } from '@/lib/env';
import { isAdminAuthorized } from '@/lib/orders/access';

export const runtime = 'nodejs';

function hasValidDebugToken(request: NextRequest): boolean {
  const debugToken = process.env.BAGET_CATALOG_DEBUG_TOKEN?.trim();
  if (!debugToken) {
    return false;
  }

  const requestToken = request.nextUrl.searchParams.get('debugToken')?.trim()
    || request.headers.get('x-debug-token')?.trim()
    || '';
  return requestToken === debugToken;
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 });
  }

  const env = getServerEnv();
  const hasAdminAccess = isAdminAuthorized(request, env.ADMIN_TOKEN);
  if (!hasAdminAccess && !hasValidDebugToken(request)) {
    return NextResponse.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
  }

  const result = await loadBagetCatalog();

  return NextResponse.json({
    ok: result.source === 'sheet',
    source: result.source,
    sheetId: result.sheetId,
    tab: result.tab,
    count: result.items.length,
    firstItems: result.items.slice(0, 5),
    error: result.error,
  });
}

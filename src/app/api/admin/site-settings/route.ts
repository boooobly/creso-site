import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';
import { createSiteSetting, listSiteSettings } from '@/lib/admin/site-settings-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const query = request.nextUrl.searchParams;
    const result = await listSiteSettings({
      page: query.get('page') ?? undefined,
      pageSize: query.get('pageSize') ?? undefined,
      group: query.get('group') ?? undefined
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const payload = await request.json();
    const item = await createSiteSetting(payload);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

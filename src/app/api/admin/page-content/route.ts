import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';
import { createPageContentItem, listPageContentItems } from '@/lib/admin/page-content-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const query = request.nextUrl.searchParams;
    const result = await listPageContentItems({
      page: query.get('page') ?? undefined,
      pageSize: query.get('pageSize') ?? undefined,
      pageKey: query.get('pageKey') ?? undefined,
      sectionKey: query.get('sectionKey') ?? undefined
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
    const item = await createPageContentItem(payload);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

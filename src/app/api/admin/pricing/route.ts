import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';
import { createPricingEntry, listPricingEntries } from '@/lib/admin/pricing-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const query = request.nextUrl.searchParams;
    const result = await listPricingEntries({
      page: query.get('page') ?? undefined,
      pageSize: query.get('pageSize') ?? undefined,
      category: query.get('category') ?? undefined,
      isActive: query.get('isActive') === null ? undefined : query.get('isActive') === 'true'
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const payload = await request.json();
    const item = await createPricingEntry(payload);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

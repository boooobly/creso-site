import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';
import { createPortfolioItem, listPortfolioItems } from '@/lib/admin/portfolio-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const query = request.nextUrl.searchParams;
    const result = await listPortfolioItems({
      page: query.get('page') ?? undefined,
      pageSize: query.get('pageSize') ?? undefined,
      category: query.get('category') ?? undefined,
      published: query.get('published') === null ? undefined : query.get('published') === 'true',
      search: query.get('search') ?? undefined
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
    const item = await createPortfolioItem(payload);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

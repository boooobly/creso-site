import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';
import { createMediaAsset, listMediaAssets } from '@/lib/admin/media-assets-service';
import { revalidateAfterMediaChange } from '@/lib/admin/media-revalidation';

export const runtime = 'nodejs';


function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}


export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const query = request.nextUrl.searchParams;
    const scope = query.get('scope');
    const search = query.get('search')?.trim() ?? '';
    const page = parsePositiveInt(query.get('page'), 1);
    const pageSize = Math.min(parsePositiveInt(query.get('pageSize'), 20), 100);

    const result = await listMediaAssets({
      page,
      pageSize,
      scope: scope === 'site' || scope === 'portfolio' ? scope : undefined,
      search: search.length > 0 ? search : undefined,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('[api][admin][media][list] failed', error);
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false, error: 'Не удалось загрузить изображения.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const payload = await request.json();
    const item = await createMediaAsset(payload);
    revalidateAfterMediaChange(item);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    console.error('[api][admin][media][create] failed', error);
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false, error: 'Не удалось создать запись изображения в базе данных.' }, { status: 500 });
  }
}

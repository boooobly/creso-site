import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';
import { deleteMediaAsset, updateMediaAsset } from '@/lib/admin/media-assets-service';
import { revalidateAfterMediaChange } from '@/lib/admin/media-revalidation';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const payload = await request.json();
    const item = await updateMediaAsset(resolvedParams.id, payload);
    revalidateAfterMediaChange(item);
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    logger.error('api.admin.media.update.failed', { id: resolvedParams.id, error });
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false, error: 'Не удалось обновить запись изображения.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const deleted = await deleteMediaAsset(resolvedParams.id);
    revalidateAfterMediaChange(deleted);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('api.admin.media.delete.failed', { id: resolvedParams.id, error });
    const fallback = error instanceof Error ? error.message : 'Не удалось удалить изображение.';
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false, error: fallback }, { status: 400 });
  }
}

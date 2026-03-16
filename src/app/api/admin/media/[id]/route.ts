import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';
import { deleteMediaAsset, updateMediaAsset } from '@/lib/admin/media-assets-service';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const payload = await request.json();
    const item = await updateMediaAsset(params.id, payload);
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    await deleteMediaAsset(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const fallback = error instanceof Error ? error.message : 'Не удалось удалить изображение.';
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false, error: fallback }, { status: 400 });
  }
}

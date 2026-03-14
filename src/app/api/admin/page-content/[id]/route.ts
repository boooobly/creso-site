import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';
import { deletePageContentItem, updatePageContentItem } from '@/lib/admin/page-content-service';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const payload = await request.json();
    const item = await updatePageContentItem(params.id, payload);
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    await deletePageContentItem(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';

export const runtime = 'nodejs';

const actionSchema = z.object({
  action: z.enum(['approve', 'reject'])
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauthorized = requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const payload = await request.json().catch(() => null);
    const parsed = actionSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Некорректное действие.' }, { status: 400 });
    }

    const nextStatus = parsed.data.action === 'approve' ? 'approved' : 'rejected';

    const review = await prisma.review
      .update({
        where: { id: params.id },
        data: {
          status: nextStatus,
          moderatedAt: new Date()
        },
        select: {
          id: true,
          status: true,
          moderatedAt: true
        }
      })
      .catch(() => null);

    if (!review) {
      return NextResponse.json({ ok: false, error: 'Отзыв не найден.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

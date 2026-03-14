import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { requireAdminApiAuth } from '@/lib/admin/api-auth';
import { handleAdminApiError } from '@/lib/admin/api-errors';

export const runtime = 'nodejs';

const statusSchema = z.enum(['pending', 'approved', 'rejected']);

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAdminApiAuth(request);
    if (unauthorized) return unauthorized;

    const parsed = statusSchema.safeParse(request.nextUrl.searchParams.get('status') || 'pending');

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Некорректный статус фильтра.' }, { status: 400 });
    }

    const items = await prisma.review.findMany({
      where: { status: parsed.data },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        name: true,
        isAnonymous: true,
        rating: true,
        text: true,
        status: true,
        createdAt: true,
        moderatedAt: true
      }
    });

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return handleAdminApiError(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getServerEnv } from '@/lib/env';

export const runtime = 'nodejs';

const actionSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

function isAdminAuthorized(request: NextRequest, adminToken: string): boolean {
  const headerToken = request.headers.get('x-admin-token');
  return headerToken === adminToken;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const env = getServerEnv();
    if (!isAdminAuthorized(request, env.ADMIN_TOKEN)) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const payload = await request.json().catch(() => null);
    const parsed = actionSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid action.' }, { status: 400 });
    }

    const nextStatus = parsed.data.action === 'approve' ? 'approved' : 'rejected';

    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        status: nextStatus,
        moderatedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        moderatedAt: true,
      },
    }).catch(() => null);

    if (!review) {
      return NextResponse.json({ ok: false, error: 'Review not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.startsWith('[env]')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    throw error;
  }
}

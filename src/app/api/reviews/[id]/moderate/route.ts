import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/env';
import { REVIEW_STATUSES } from '@/lib/reviews/constants';

export const runtime = 'nodejs';

const moderateReviewSchema = z.object({
  status: z.enum([REVIEW_STATUSES.approved, REVIEW_STATUSES.rejected]),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!env.REVIEW_MODERATION_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Moderation is not configured.' }, { status: 503 });
  }

  const token = request.headers.get('x-moderation-token');
  if (token !== env.REVIEW_MODERATION_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = moderateReviewSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid moderation status.' }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      moderatedAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      moderatedAt: true,
    },
  }).catch(() => null);

  if (!updated) {
    return NextResponse.json({ ok: false, error: 'Review not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, review: updated });
}

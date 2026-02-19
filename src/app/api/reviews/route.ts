import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getClientIp } from '@/lib/utils/request';
import { hashIp } from '@/lib/reviews/hash';
import { REVIEW_STATUSES } from '@/lib/reviews/constants';

export const runtime = 'nodejs';

const createReviewSchema = z.object({
  name: z.string().trim().max(120).optional(),
  isAnonymous: z.boolean().default(false),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(3000),
  company: z.string().optional(),
});

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: { status: REVIEW_STATUSES.approved },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      isAnonymous: true,
      rating: true,
      text: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const parsed = createReviewSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Проверьте корректность данных отзыва.' }, { status: 400 });
  }

  if (parsed.data.company?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent')?.trim() || null;

  await prisma.review.create({
    data: {
      name: parsed.data.name?.trim() || null,
      isAnonymous: parsed.data.isAnonymous,
      rating: parsed.data.rating,
      text: parsed.data.text,
      status: REVIEW_STATUSES.pending,
      ipHash: hashIp(ip),
      userAgent,
    },
  });

  return NextResponse.json({ ok: true, status: REVIEW_STATUSES.pending });
}

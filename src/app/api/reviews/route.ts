import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { REVIEW_STATUSES } from '@/lib/reviews/constants';

export const runtime = 'nodejs';

const createReviewSchema = z.object({
  name: z.string().trim().max(120).optional(),
  isAnonymous: z.boolean().default(false),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(3000),
  company: z.string().optional(),
});

type ReviewsListResponse = {
  items: Array<{
    id: string;
    name: string;
    isAnonymous: boolean;
    rating: number;
    text: string;
    createdAt: string;
  }>;
  totalApproved: number;
  averageRating: number | null;
  nextCursor: string | null;
};

const EMPTY_REVIEWS_RESPONSE: ReviewsListResponse = {
  items: [],
  totalApproved: 0,
  averageRating: null,
  nextCursor: null,
};

export async function GET() {
  return NextResponse.json(EMPTY_REVIEWS_RESPONSE);
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

  return NextResponse.json({
    ok: true,
    status: REVIEW_STATUSES.pending,
    message: 'Отзыв принят и ожидает модерации.',
  });
}

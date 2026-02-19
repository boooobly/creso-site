import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:ru|com|net|org|io|dev|app|info|biz|me|co|su|рф)\b)/i;

const createReviewSchema = z.object({
  name: z.string().trim().max(120).optional(),
  isAnonymous: z.boolean(),
  rating: z.number().int().min(1).max(5),
  text: z
    .string()
    .trim()
    .min(20, 'Минимальная длина отзыва — 20 символов.')
    .max(3000, 'Максимальная длина отзыва — 3000 символов.')
    .refine((value) => !URL_PATTERN.test(value), 'Ссылки в отзывах запрещены.'),
  website: z.string().optional(),
});

const emptyReviewsResponse = {
  items: [],
  totalApproved: 0,
  averageRating: null,
  nextCursor: null,
} satisfies {
  items: Array<{ id: string; name: string | null; isAnonymous: boolean; rating: number; text: string; createdAt: string }>;
  totalApproved: number;
  averageRating: number | null;
  nextCursor: string | null;
};

export async function GET() {
  return NextResponse.json(emptyReviewsResponse, { status: 200 });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const parsed = createReviewSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Проверьте корректность данных отзыва.' }, { status: 400 });
  }

  if (parsed.data.website?.trim()) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ ok: true, status: 'pending' }, { status: 201 });
}

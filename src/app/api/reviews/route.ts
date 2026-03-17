import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { hashIp } from '@/lib/reviews/hash';

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

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0]?.trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  return realIp || null;
}

export async function GET() {
  return NextResponse.json(emptyReviewsResponse, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ ok: false, error: 'Некорректный JSON в запросе.' }, { status: 400 });
    }

    const parsed = createReviewSchema.safeParse(payload);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Проверьте корректность данных отзыва.';
      return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
    }

    if (parsed.data.website?.trim()) {
      return new NextResponse(null, { status: 204 });
    }

    const name = parsed.data.name?.trim();

    await prisma.review.create({
      data: {
        name: name ? name : null,
        isAnonymous: parsed.data.isAnonymous,
        rating: parsed.data.rating,
        text: parsed.data.text,
        status: 'pending',
        ipHash: hashIp(getClientIp(request) ?? 'unknown'),
        userAgent: request.headers.get('user-agent')?.slice(0, 512) || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, status: 'pending' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('[env]')) {
      return NextResponse.json(
        { ok: false, error: 'Отправка отзывов временно недоступна. Попробуйте позже.' },
        { status: 503 },
      );
    }

    console.error('[api/reviews] POST failed', error);
    return NextResponse.json({ ok: false, error: 'Внутренняя ошибка сервера.' }, { status: 500 });
  }
}

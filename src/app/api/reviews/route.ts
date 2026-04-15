import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { hashIp } from '@/lib/reviews/hash';
import { enforcePublicRequestGuard } from '@/lib/anti-spam';
import { logger } from '@/lib/logger';

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


const listReviewsQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0]?.trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  return realIp || null;
}

export async function GET(request: NextRequest) {
  try {
    const parsedQuery = listReviewsQuerySchema.safeParse({
      cursor: request.nextUrl.searchParams.get('cursor') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ ok: false, error: 'Некорректные параметры запроса.' }, { status: 400 });
    }

    const { cursor, limit } = parsedQuery.data;

    const [reviews, totalApproved, ratingStats] = await prisma.$transaction([
      prisma.review.findMany({
        where: { status: 'approved' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        take: limit + 1,
        select: {
          id: true,
          name: true,
          isAnonymous: true,
          rating: true,
          text: true,
          createdAt: true,
        },
      }),
      prisma.review.count({ where: { status: 'approved' } }),
      prisma.review.aggregate({
        where: { status: 'approved' },
        _avg: { rating: true },
      }),
    ]);

    const hasMore = reviews.length > limit;
    const pageItems = hasMore ? reviews.slice(0, limit) : reviews;

    return NextResponse.json(
      {
        items: pageItems.map((item) => ({
          id: item.id,
          name: item.name,
          isAnonymous: item.isAnonymous,
          rating: item.rating,
          text: item.text,
          createdAt: item.createdAt.toISOString(),
        })),
        totalApproved,
        averageRating: ratingStats._avg.rating,
        nextCursor: hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('api.reviews.get.failed', { error });
    return NextResponse.json({ ok: false, error: 'Внутренняя ошибка сервера.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ ok: false, error: 'Некорректный JSON в запросе.' }, { status: 400 });
    }

    const blockedResponse = enforcePublicRequestGuard(request, {
      route: '/api/reviews',
      payload,
      honeypotFields: ['website'],
      requirePayload: true,
    });
    if (blockedResponse) return blockedResponse;

    const parsed = createReviewSchema.safeParse(payload);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Проверьте корректность данных отзыва.';
      return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
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

    logger.error('api.reviews.post.failed', { error });
    return NextResponse.json({ ok: false, error: 'Внутренняя ошибка сервера.' }, { status: 500 });
  }
}

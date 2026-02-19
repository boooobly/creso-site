import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import {
  getClientIp,
  hasUserAgent,
  isHoneypotTriggered,
  isRateLimited,
} from '@/lib/anti-spam';
import { buildEmailHtmlFromText } from '@/lib/utils/email';
import { sendEmailLead } from '@/lib/notifications/email';
import { sendTelegramLead } from '@/lib/notifications/telegram';
import { hashIp } from '@/lib/reviews/hash';
import { REVIEW_STATUSES } from '@/lib/reviews/constants';
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

const listQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});

function buildReviewNotification(params: {
  name: string;
  isAnonymous: boolean;
  rating: number;
  text: string;
  ip: string;
  userAgent: string;
}): string {
  return [
    '📝 Новый отзыв (PENDING)',
    `Имя: ${params.name}`,
    `Анонимно: ${params.isAnonymous ? 'Да' : 'Нет'}`,
    `Оценка: ${params.rating}/5`,
    `Текст: ${params.text}`,
    `IP: ${params.ip || 'unknown'}`,
    `UA: ${params.userAgent || 'unknown'}`,
    `Время: ${new Date().toISOString()}`,
  ].join('\n');
}

export async function GET(request: NextRequest) {
  const parsed = listQuerySchema.safeParse({
    cursor: request.nextUrl.searchParams.get('cursor') || undefined,
    limit: request.nextUrl.searchParams.get('limit') || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Некорректные параметры пагинации.' }, { status: 400 });
  }

  const { cursor, limit } = parsed.data;

  const [reviews, summary] = await Promise.all([
    prisma.review.findMany({
      where: { status: REVIEW_STATUSES.approved },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor
        ? {
          cursor: { id: cursor },
          skip: 1,
        }
        : {}),
      select: {
        id: true,
        name: true,
        isAnonymous: true,
        rating: true,
        text: true,
        createdAt: true,
      },
    }),
    prisma.review.aggregate({
      where: { status: REVIEW_STATUSES.approved },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const hasMore = reviews.length > limit;
  const pageItems = hasMore ? reviews.slice(0, limit) : reviews;

  return NextResponse.json({
    items: pageItems.map((review) => ({
      id: review.id,
      name: review.isAnonymous ? null : review.name,
      isAnonymous: review.isAnonymous,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt.toISOString(),
    })),
    totalApproved: summary._count._all,
    averageRating: summary._avg.rating,
    nextCursor: hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null,
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  if (isHoneypotTriggered(payload, 'website')) {
    return new NextResponse(null, { status: 204 });
  }

  if (!hasUserAgent(request)) {
    return NextResponse.json({ ok: false, error: 'Отсутствует User-Agent.' }, { status: 400 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent')?.trim() || 'unknown';

  if (isRateLimited(`${ip}:${userAgent}`)) {
    return NextResponse.json({ ok: false, error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 });
  }

  const parsed = createReviewSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Проверьте корректность данных отзыва.' }, { status: 400 });
  }

  const cleanName = parsed.data.name?.trim() || null;

  await prisma.review.create({
    data: {
      name: cleanName,
      isAnonymous: parsed.data.isAnonymous,
      rating: parsed.data.rating,
      text: parsed.data.text,
      status: REVIEW_STATUSES.pending,
      ipHash: hashIp(ip),
      userAgent,
    },
  });

  const notificationText = buildReviewNotification({
    name: parsed.data.isAnonymous ? 'Анонимно' : cleanName || 'Клиент',
    isAnonymous: parsed.data.isAnonymous,
    rating: parsed.data.rating,
    text: parsed.data.text,
    ip,
    userAgent,
  });

  await Promise.all([
    sendTelegramLead(notificationText).catch((error: unknown) => {
      logger.error('reviews.notify.telegram.failed', { error });
    }),
    sendEmailLead({
      subject: 'Новый отзыв (ожидает модерации)',
      html: buildEmailHtmlFromText(notificationText),
    }).catch((error: unknown) => {
      logger.error('reviews.notify.email.failed', { error });
    }),
  ]);

  return NextResponse.json({ ok: true, status: REVIEW_STATUSES.pending }, { status: 201 });
}

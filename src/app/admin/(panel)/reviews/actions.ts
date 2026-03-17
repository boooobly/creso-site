'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const reviewStatusSchema = z.enum(['pending', 'approved', 'rejected']);

function buildRedirect(searchParams: URLSearchParams, patch: Record<string, string | null>) {
  const nextParams = new URLSearchParams(searchParams.toString());

  for (const [key, value] of Object.entries(patch)) {
    if (!value) {
      nextParams.delete(key);
      continue;
    }

    nextParams.set(key, value);
  }

  const query = nextParams.toString();
  return `/admin/reviews${query ? `?${query}` : ''}`;
}

function redirectWithMessage(formData: FormData, patch: Record<string, string | null>): never {
  const current = String(formData.get('redirectSearchParams') ?? '');
  const currentParams = new URLSearchParams(current);
  redirect(buildRedirect(currentParams, patch));
}

export async function setReviewStatusAction(formData: FormData) {
  const reviewId = String(formData.get('reviewId') ?? '').trim();
  const parsedStatus = reviewStatusSchema.safeParse(String(formData.get('nextStatus') ?? '').trim());

  if (!reviewId || !parsedStatus.success) {
    redirectWithMessage(formData, {
      success: null,
      error: 'Не удалось изменить статус отзыва. Обновите страницу и попробуйте снова.'
    });
  }

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: parsedStatus.data,
        moderatedAt: new Date()
      }
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/reviews');

    redirectWithMessage(formData, {
      error: null,
      success: parsedStatus.data === 'approved' ? 'published' : parsedStatus.data === 'pending' ? 'returned-to-queue' : 'hidden'
    });
  } catch {
    redirectWithMessage(formData, {
      success: null,
      error: 'Не удалось обновить статус. Возможно, отзыв уже удалён.'
    });
  }
}

export async function deleteReviewAction(formData: FormData) {
  const reviewId = String(formData.get('reviewId') ?? '').trim();

  if (!reviewId) {
    redirectWithMessage(formData, {
      success: null,
      error: 'Не удалось удалить отзыв. Обновите страницу и повторите.'
    });
  }

  try {
    await prisma.review.delete({ where: { id: reviewId } });

    revalidatePath('/admin/reviews');
    revalidatePath('/reviews');

    redirectWithMessage(formData, {
      error: null,
      success: 'deleted'
    });
  } catch {
    redirectWithMessage(formData, {
      success: null,
      error: 'Не удалось удалить отзыв. Возможно, его уже удалили ранее.'
    });
  }
}

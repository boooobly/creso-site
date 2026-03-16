'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import {
  createPortfolioItem,
  deletePortfolioItem,
  updatePortfolioItem
} from '@/lib/admin/portfolio-service';
import { createMediaAsset, deleteMediaAsset } from '@/lib/admin/media-assets-service';
import { portfolioItemSchema } from '@/lib/admin/validation';

type ActionResult = {
  error?: string;
};

type PortfolioPayload = ReturnType<typeof formDataToPayload>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true' || value === '1';
}

function parseGalleryImages(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return [];

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/').filter(Boolean);
    const candidate = parts.at(-1);
    return candidate?.slice(0, 500);
  } catch {
    return undefined;
  }
}

function formDataToPayload(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();

  return {
    title,
    slug: slugInput || slugify(title),
    category: String(formData.get('category') ?? '').trim(),
    shortDescription: String(formData.get('shortDescription') ?? '').trim() || undefined,
    coverImage: String(formData.get('coverImage') ?? '').trim() || undefined,
    coverImageAssetId: String(formData.get('coverImageAssetId') ?? '').trim() || undefined,
    galleryImages: parseGalleryImages(formData.get('galleryImages')),
    featured: parseBoolean(formData.get('featured')),
    published: parseBoolean(formData.get('published')),
    sortOrder: Number(formData.get('sortOrder') ?? 0)
  };
}

async function ensureCoverImageAsset(payload: PortfolioPayload) {
  if (!payload.coverImage || payload.coverImageAssetId) {
    return { payload, createdAssetId: null as string | null };
  }

  const created = await createMediaAsset({
    title: payload.title,
    kind: 'image',
    scope: 'portfolio',
    url: payload.coverImage,
    fileName: getFileNameFromUrl(payload.coverImage),
    altText: payload.title,
    isActive: true,
    sortOrder: payload.sortOrder
  });

  return {
    payload: {
      ...payload,
      coverImageAssetId: created.id
    },
    createdAssetId: created.id
  };
}

function mapActionError(error: unknown): ActionResult {
  if (error instanceof ZodError) {
    return { error: error.issues[0]?.message ?? 'Проверьте корректность заполнения формы.' };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return { error: 'Запись с таким URL-именем уже существует. Укажите другой слаг.' };
    }

    if (error.code === 'P2003') {
      return { error: 'Не удалось привязать изображение. Попробуйте загрузить его еще раз.' };
    }

    if (error.code === 'P2022') {
      return { error: 'Структура базы данных не обновлена. Примените последние миграции и повторите попытку.' };
    }
  }

  if (error instanceof Error && error.message) {
    return { error: error.message };
  }

  return { error: 'Не удалось сохранить изменения. Попробуйте еще раз.' };
}

export async function createPortfolioItemAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  let createdAssetId: string | null = null;
  let redirectTo: string | null = null;

  try {
    const payload = formDataToPayload(formData);
    const ensured = await ensureCoverImageAsset(payload);
    createdAssetId = ensured.createdAssetId;
    const parsed = portfolioItemSchema.parse(ensured.payload);
    await createPortfolioItem(parsed);

    revalidatePath('/admin/portfolio');
    redirectTo = '/admin/portfolio?success=created';
  } catch (error) {
    console.error('[admin][portfolio][create] failed', error);

    if (createdAssetId) {
      await deleteMediaAsset(createdAssetId).catch((cleanupError) => {
        console.error('[admin][portfolio][create] cover asset cleanup failed', cleanupError);
      });
    }

    return mapActionError(error);
  }

  if (redirectTo) {
    redirect(redirectTo);
  }

  return {};
}

export async function updatePortfolioItemAction(
  id: string,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  let createdAssetId: string | null = null;
  let redirectTo: string | null = null;

  try {
    const payload = formDataToPayload(formData);
    const ensured = await ensureCoverImageAsset(payload);
    createdAssetId = ensured.createdAssetId;
    const parsed = portfolioItemSchema.parse(ensured.payload);
    await updatePortfolioItem(id, parsed);

    revalidatePath('/admin/portfolio');
    revalidatePath(`/admin/portfolio/${id}`);
    redirectTo = '/admin/portfolio?success=updated';
  } catch (error) {
    console.error('[admin][portfolio][update] failed', { id, error });

    if (createdAssetId) {
      await deleteMediaAsset(createdAssetId).catch((cleanupError) => {
        console.error('[admin][portfolio][update] cover asset cleanup failed', cleanupError);
      });
    }

    return mapActionError(error);
  }

  if (redirectTo) {
    redirect(redirectTo);
  }

  return {};
}

export async function removePortfolioItemAction(id: string) {
  await deletePortfolioItem(id);
  revalidatePath('/admin/portfolio');
  redirect('/admin/portfolio?success=deleted');
}

export async function quickTogglePortfolioPublishAction(id: string, nextPublished: boolean) {
  await updatePortfolioItem(id, { published: nextPublished });
  revalidatePath('/admin/portfolio');
}

export async function quickTogglePortfolioFeaturedAction(id: string, nextFeatured: boolean) {
  await updatePortfolioItem(id, { featured: nextFeatured });
  revalidatePath('/admin/portfolio');
}

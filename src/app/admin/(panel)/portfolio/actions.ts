'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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
  const normalizeEntry = (entry: { url: string; assetId?: string }) => ({
    url: entry.url,
    ...(entry.assetId ? { assetId: entry.assetId } : {})
  });

  if (typeof value !== 'string') return [];

  const raw = value.trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        if (typeof entry === 'string') {
          const url = entry.trim();
          return url ? { url } : null;
        }

        if (!entry || typeof entry !== 'object') {
          return null;
        }

        const url = String((entry as { url?: unknown }).url ?? '').trim();
        const assetId = String((entry as { assetId?: unknown }).assetId ?? '').trim();

        if (!url) return null;
        return normalizeEntry({ url, assetId: assetId || undefined });
      })
      .filter((entry): entry is { url: string; assetId?: string } => Boolean(entry));
  } catch {
    return raw
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((url) => normalizeEntry({ url }));
  }
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
  const galleryImages = parseGalleryImages(formData.get('galleryImages'));
  const coverImageFromGallery = galleryImages[0]?.url;

  return {
    title,
    slug: slugInput || slugify(title),
    category: String(formData.get('category') ?? '').trim(),
    shortDescription: String(formData.get('shortDescription') ?? '').trim() || undefined,
    coverImage: String(formData.get('coverImage') ?? '').trim() || coverImageFromGallery || undefined,
    coverImageAssetId: String(formData.get('coverImageAssetId') ?? '').trim() || undefined,
    galleryImages,
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
      coverImageAssetId: created.id,
      galleryImages: payload.galleryImages.map((image, index) =>
        index === 0 || image.url === payload.coverImage ? { ...image, assetId: image.assetId ?? created.id } : image
      )
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
  let shouldRedirect = false;

  try {
    const payload = formDataToPayload(formData);
    const ensured = await ensureCoverImageAsset(payload);
    createdAssetId = ensured.createdAssetId;
    const parsed = portfolioItemSchema.parse(ensured.payload);
    await createPortfolioItem(parsed);

    revalidatePath('/admin/portfolio');
    revalidatePath('/portfolio');
    revalidatePath('/');
    shouldRedirect = true;
  } catch (error) {
    console.error('[admin][portfolio][create] failed', error);

    if (createdAssetId) {
      await deleteMediaAsset(createdAssetId).catch((cleanupError) => {
        console.error('[admin][portfolio][create] cover asset cleanup failed', cleanupError);
      });
    }

    return mapActionError(error);
  }

  if (shouldRedirect) {
    redirect('/admin/portfolio?success=created');
  }

  return {};
}

export async function updatePortfolioItemAction(
  id: string,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  let createdAssetId: string | null = null;
  let shouldRedirect = false;

  try {
    const payload = formDataToPayload(formData);
    const ensured = await ensureCoverImageAsset(payload);
    createdAssetId = ensured.createdAssetId;
    const parsed = portfolioItemSchema.parse(ensured.payload);
    await updatePortfolioItem(id, parsed);

    revalidatePath('/admin/portfolio');
    revalidatePath(`/admin/portfolio/${id}`);
    revalidatePath('/portfolio');
    revalidatePath('/');
    shouldRedirect = true;
  } catch (error) {
    console.error('[admin][portfolio][update] failed', { id, error });

    if (createdAssetId) {
      await deleteMediaAsset(createdAssetId).catch((cleanupError) => {
        console.error('[admin][portfolio][update] cover asset cleanup failed', cleanupError);
      });
    }

    return mapActionError(error);
  }

  if (shouldRedirect) {
    redirect('/admin/portfolio?success=updated');
  }

  return {};
}

export async function removePortfolioItemAction(id: string) {
  await deletePortfolioItem(id);
  revalidatePath('/admin/portfolio');
  revalidatePath('/portfolio');
  revalidatePath('/');
  redirect('/admin/portfolio?success=deleted');
}

export async function quickTogglePortfolioPublishAction(id: string, nextPublished: boolean) {
  await updatePortfolioItem(id, { published: nextPublished });
  revalidatePath('/admin/portfolio');
  revalidatePath('/portfolio');
  revalidatePath('/');
}

export async function quickTogglePortfolioFeaturedAction(id: string, nextFeatured: boolean) {
  await updatePortfolioItem(id, { featured: nextFeatured });
  revalidatePath('/admin/portfolio');
  revalidatePath('/portfolio');
  revalidatePath('/');
}

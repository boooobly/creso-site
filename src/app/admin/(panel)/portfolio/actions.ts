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
import { portfolioItemSchema } from '@/lib/admin/validation';

type ActionResult = {
  error?: string;
};

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

function formDataToPayload(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();

  return {
    title,
    slug: slugInput || slugify(title),
    category: String(formData.get('category') ?? '').trim(),
    shortDescription: String(formData.get('shortDescription') ?? '').trim() || undefined,
    coverImage: String(formData.get('coverImage') ?? '').trim() || undefined,
    galleryImages: parseGalleryImages(formData.get('galleryImages')),
    featured: parseBoolean(formData.get('featured')),
    published: parseBoolean(formData.get('published')),
    sortOrder: Number(formData.get('sortOrder') ?? 0)
  };
}

function mapActionError(error: unknown): ActionResult {
  if (error instanceof ZodError) {
    return { error: error.issues[0]?.message ?? 'Проверьте корректность заполнения формы.' };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return { error: 'Запись с таким URL-именем уже существует. Укажите другой слаг.' };
  }

  return { error: 'Не удалось сохранить изменения. Попробуйте еще раз.' };
}

export async function createPortfolioItemAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const payload = formDataToPayload(formData);
    const parsed = portfolioItemSchema.parse(payload);
    await createPortfolioItem(parsed);

    revalidatePath('/admin/portfolio');
    redirect('/admin/portfolio?success=created');
  } catch (error) {
    return mapActionError(error);
  }
}

export async function updatePortfolioItemAction(
  id: string,
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const payload = formDataToPayload(formData);
    const parsed = portfolioItemSchema.parse(payload);
    await updatePortfolioItem(id, parsed);

    revalidatePath('/admin/portfolio');
    revalidatePath(`/admin/portfolio/${id}`);
    redirect('/admin/portfolio?success=updated');
  } catch (error) {
    return mapActionError(error);
  }
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

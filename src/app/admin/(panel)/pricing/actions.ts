'use server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createPriceCategory,
  createPriceItem,
  deletePriceCategory,
  deletePriceItem,
  updatePriceCategory,
  updatePriceItem,
} from '@/lib/admin/price-catalog-service';
import { updateBaguetteExtrasPricingEntry } from '@/lib/admin/baguette-extras-pricing-service';
import { updateWideFormatPricingEntry } from '@/lib/wide-format/wideFormatPricing';
import { updatePlotterCuttingPricingEntry } from '@/lib/plotter-cutting/plotterCuttingPricing';
import { updateHeatTransferPricingEntry } from '@/lib/heat-transfer/heatTransferPricing';
import { updatePrintPricingEntry } from '@/lib/print/printPricing';

function parseBoolean(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true' || value === '1';
}


function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return base.length >= 2 ? base : `category-${Date.now()}`;
}

function parseSortOrder(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function redirectWithError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? 'Проверьте заполнение формы.';
    redirect(`/admin/pricing?error=${encodeURIComponent(message)}`);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    redirect('/admin/pricing?error=%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F+%D1%81+%D1%82%D0%B0%D0%BA%D0%B8%D0%BC+%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5%D0%BC+%D1%83%D0%B6%D0%B5+%D0%B5%D1%81%D1%82%D1%8C.+%D0%A3%D1%82%D0%BE%D1%87%D0%BD%D0%B8%D1%82%D0%B5+%D0%BD%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5.');
  }

  if (error instanceof Error && error.message) {
    redirect(`/admin/pricing?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/admin/pricing?error=%D0%9D%D0%B5+%D1%83%D0%B4%D0%B0%D0%BB%D0%BE%D1%81%D1%8C+%D1%81%D0%BE%D1%85%D1%80%D0%B0%D0%BD%D0%B8%D1%82%D1%8C+%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F.');
}

export async function createPriceCategoryAction(formData: FormData) {
  try {
    await createPriceCategory({
      name: String(formData.get('name') ?? '').trim(),
      slug: slugify(String(formData.get('name') ?? '')),
      description: String(formData.get('description') ?? '').trim() || undefined,
      kind: String(formData.get('kind') ?? 'general').trim() === 'baguette_extras' ? 'baguette_extras' : 'general',
      isActive: parseBoolean(formData.get('isActive')),
      sortOrder: parseSortOrder(formData.get('sortOrder')),
    });

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=category-created');
  } catch (error) {
    redirectWithError(error);
  }
}

export async function updatePriceCategoryAction(id: string, formData: FormData) {
  try {
    await updatePriceCategory(id, {
      name: String(formData.get('name') ?? '').trim(),
      slug: String(formData.get('slug') ?? '').trim() || slugify(String(formData.get('name') ?? '')),
      description: String(formData.get('description') ?? '').trim() || undefined,
      kind: String(formData.get('kind') ?? 'general').trim() === 'baguette_extras' ? 'baguette_extras' : 'general',
      isActive: parseBoolean(formData.get('isActive')),
      sortOrder: parseSortOrder(formData.get('sortOrder')),
    });

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=category-updated');
  } catch (error) {
    redirectWithError(error);
  }
}

export async function deletePriceCategoryAction(id: string) {
  try {
    await deletePriceCategory(id);
    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=category-deleted');
  } catch (error) {
    redirectWithError(error);
  }
}

export async function createPriceItemAction(formData: FormData) {
  try {
    await createPriceItem({
      categoryId: String(formData.get('categoryId') ?? '').trim(),
      title: String(formData.get('title') ?? '').trim(),
      price: String(formData.get('price') ?? '0').trim(),
      unit: String(formData.get('unit') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim() || undefined,
      isActive: parseBoolean(formData.get('isActive')),
      sortOrder: parseSortOrder(formData.get('sortOrder')),
    });

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=item-created');
  } catch (error) {
    redirectWithError(error);
  }
}

export async function updatePriceItemAction(id: string, formData: FormData) {
  try {
    await updatePriceItem(id, {
      categoryId: String(formData.get('categoryId') ?? '').trim(),
      title: String(formData.get('title') ?? '').trim(),
      price: String(formData.get('price') ?? '0').trim(),
      unit: String(formData.get('unit') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim() || undefined,
      isActive: parseBoolean(formData.get('isActive')),
      sortOrder: parseSortOrder(formData.get('sortOrder')),
    });

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=item-updated');
  } catch (error) {
    redirectWithError(error);
  }
}

export async function deletePriceItemAction(id: string) {
  try {
    await deletePriceItem(id);
    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=item-deleted');
  } catch (error) {
    redirectWithError(error);
  }
}


export async function updateBaguetteExtrasPricingEntryAction(entryId: string, formData: FormData) {
  try {
    const rawValue = String(formData.get('value') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();
    await updateBaguetteExtrasPricingEntry(entryId, rawValue, note || undefined);

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=baguette-config-updated');
  } catch (error) {
    if (error instanceof SyntaxError) {
      redirect('/admin/pricing?error=%D0%97%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D0%B5+JSON+%D0%B7%D0%B0%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%BE+%D1%81+%D0%BE%D1%88%D0%B8%D0%B1%D0%BA%D0%BE%D0%B9.');
    }
    redirectWithError(error);
  }
}


export async function updateWideFormatPricingEntryAction(entryId: string, formData: FormData) {
  try {
    const rawValue = String(formData.get('value') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();
    await updateWideFormatPricingEntry(entryId, rawValue, note || undefined);

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=wide-format-config-updated');
  } catch (error) {
    redirectWithError(error);
  }
}


export async function updatePlotterCuttingPricingEntryAction(entryId: string, formData: FormData) {
  try {
    const rawValue = String(formData.get('value') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();
    await updatePlotterCuttingPricingEntry(entryId, rawValue, note || undefined);

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=plotter-cutting-config-updated');
  } catch (error) {
    redirectWithError(error);
  }
}


export async function updateHeatTransferPricingEntryAction(entryId: string, formData: FormData) {
  try {
    const rawValue = String(formData.get('value') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();
    await updateHeatTransferPricingEntry(entryId, rawValue, note || undefined);

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=heat-transfer-config-updated');
  } catch (error) {
    redirectWithError(error);
  }
}


export async function updatePrintPricingEntryAction(entryId: string, formData: FormData) {
  try {
    const rawValue = String(formData.get('value') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();
    await updatePrintPricingEntry(entryId, rawValue, note || undefined);

    revalidatePath('/admin/pricing');
    redirect('/admin/pricing?success=print-config-updated');
  } catch (error) {
    redirectWithError(error);
  }
}

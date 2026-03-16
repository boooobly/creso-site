'use server';

import { ZodError } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getPageContentDefinition } from '@/lib/admin/page-content-config';
import { upsertPageContentFields } from '@/lib/admin/page-content-service';

export async function savePageContentAction(formData: FormData) {
  const pageKey = String(formData.get('pageKey') ?? '').trim();
  const definition = getPageContentDefinition(pageKey);

  if (!definition) {
    redirect('/admin/content?error=Страница+для+редактирования+не+найдена');
  }

  try {
    const entries = definition.sections.flatMap((section, sectionIndex) =>
      section.fields.map((field, fieldIndex) => ({
        sectionKey: field.sectionKey,
        fieldKey: field.fieldKey,
        label: field.label,
        value: String(formData.get(`${field.sectionKey}__${field.fieldKey}`) ?? '').trim(),
        sortOrder: sectionIndex * 100 + fieldIndex
      }))
    );

    await upsertPageContentFields(pageKey, entries);

    revalidatePath('/admin/content');
    revalidatePath(definition.route);

    redirect(`/admin/content?success=saved&page=${encodeURIComponent(pageKey)}`);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? 'Проверьте заполнение полей.';
      redirect(`/admin/content?error=${encodeURIComponent(message)}&page=${encodeURIComponent(pageKey)}`);
    }

    if (error instanceof Error) {
      redirect(`/admin/content?error=${encodeURIComponent(error.message)}&page=${encodeURIComponent(pageKey)}`);
    }

    redirect(`/admin/content?error=Не+удалось+сохранить+изменения&page=${encodeURIComponent(pageKey)}`);
  }
}

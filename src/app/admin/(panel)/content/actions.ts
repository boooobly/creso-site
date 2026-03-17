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
      section.fields.map((field, fieldIndex) => {
        if (field.type === 'list' && field.listSchema) {
          const count = Number(formData.get(`${field.sectionKey}__${field.fieldKey}__count`) ?? 0);
          const items: Array<Record<string, string>> = [];

          for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
            const item: Record<string, string> = {};
            let hasAnyValue = false;

            for (const itemField of field.listSchema.fields) {
              const inputName = `${field.sectionKey}__${field.fieldKey}__${itemIndex}__${itemField.key}`;
              const value = String(formData.get(inputName) ?? '').trim();
              item[itemField.key] = value;
              if (value) hasAnyValue = true;
            }

            if (!hasAnyValue) {
              continue;
            }

            const missingRequiredField = field.listSchema.fields.find((itemField) => itemField.required && !item[itemField.key]);
            if (missingRequiredField) {
              throw new Error(`Заполните поле «${missingRequiredField.label}» в разделе «${field.label}»`);
            }

            items.push(item);
          }

          const minItems = field.listSchema.minItems ?? 0;
          if (items.length < minItems) {
            throw new Error(`Раздел «${field.label}»: заполните минимум ${minItems} ${field.listSchema.itemName.toLowerCase()}.`);
          }

          return {
            sectionKey: field.sectionKey,
            fieldKey: field.fieldKey,
            label: field.label,
            type: 'json_list',
            value: JSON.stringify(items),
            sortOrder: sectionIndex * 100 + fieldIndex,
          };
        }

        const rawValue = String(formData.get(`${field.sectionKey}__${field.fieldKey}`) ?? '').trim();

        return {
          sectionKey: field.sectionKey,
          fieldKey: field.fieldKey,
          label: field.label,
          type: 'string',
          value: rawValue || field.defaultValue,
          sortOrder: sectionIndex * 100 + fieldIndex,
        };
      })
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

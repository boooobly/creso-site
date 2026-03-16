'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SITE_SETTINGS_SECTIONS } from '@/lib/admin/site-settings-config';
import { upsertSiteSettings } from '@/lib/admin/site-settings-service';

const SETTINGS_SUCCESS = 'saved';

export async function saveSiteSettingsAction(formData: FormData) {
  try {
    const entries = SITE_SETTINGS_SECTIONS.flatMap((section) =>
      section.fields.map((field) => ({
        key: field.key,
        label: field.label,
        group: section.title,
        description: field.helper,
        value: String(formData.get(field.inputName) ?? '').trim(),
      }))
    );

    await upsertSiteSettings(entries);

    revalidatePath('/admin/settings');
    revalidatePath('/');
    revalidatePath('/contacts');
    revalidatePath('/portfolio');
    revalidatePath('/services');
    revalidatePath('/production');

    redirect(`/admin/settings?success=${SETTINGS_SUCCESS}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось сохранить настройки.';
    redirect(`/admin/settings?error=${encodeURIComponent(message)}`);
  }
}

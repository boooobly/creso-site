'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SITE_SETTINGS_SECTIONS } from '@/lib/admin/site-settings-config';
import { upsertSiteSettings } from '@/lib/admin/site-settings-service';

const SETTINGS_SUCCESS = 'saved';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLikelyUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function isTelegramUsername(value: string) {
  return /^@[a-zA-Z0-9_]{3,}$/.test(value);
}

function isLikelyPhone(value: string) {
  return value.replace(/\D/g, '').length >= 10;
}

function validateField(label: string, inputName: string, value: string, required?: boolean) {
  if (required && !value) {
    throw new Error(`Заполните поле «${label}».`);
  }

  if (!value) return;

  if (inputName === 'email' && !isValidEmail(value)) {
    throw new Error('Проверьте Email: укажите адрес в формате name@company.ru.');
  }

  if (inputName === 'phone' && !isLikelyPhone(value)) {
    throw new Error('Проверьте телефон: укажите номер в понятном формате, например +7 (900) 000-00-00.');
  }

  if (['vkLink', 'seoOgImage', 'whatsapp'].includes(inputName) && !isLikelyUrl(value)) {
    throw new Error(`Поле «${label}» должно начинаться с http:// или https://`);
  }

  if (inputName === 'telegram' && value && !value.startsWith('http') && !isTelegramUsername(value)) {
    throw new Error('Для Telegram укажите ссылку или username в формате @example.');
  }
}

export async function saveSiteSettingsAction(formData: FormData) {
  try {
    const entries = SITE_SETTINGS_SECTIONS.flatMap((section) =>
      section.fields.map((field) => {
        const value = String(formData.get(field.inputName) ?? '').trim();
        validateField(field.label, field.inputName, value, field.required);

        return {
          key: field.key,
          label: field.label,
          group: section.title,
          description: field.helper,
          value,
        };
      })
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
    const message = error instanceof Error ? error.message : 'Не удалось сохранить настройки. Попробуйте ещё раз.';
    redirect(`/admin/settings?error=${encodeURIComponent(message)}`);
  }
}

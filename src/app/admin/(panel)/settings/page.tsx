import { saveSiteSettingsAction } from './actions';
import { SITE_SETTINGS_SECTIONS } from '@/lib/admin/site-settings-config';
import { listSiteSettingsByKeys } from '@/lib/admin/site-settings-service';

type AdminSettingsPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

const successMessages: Record<string, string> = {
  saved: 'Настройки сохранены. Изменения на сайте обновятся автоматически.',
};

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  const keys = SITE_SETTINGS_SECTIONS.flatMap((section) => section.fields.map((field) => field.key));
  const existingMap = await listSiteSettingsByKeys(keys);
  const successMessage = searchParams?.success ? successMessages[searchParams.success] : null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900">Настройки сайта и контактов</h1>
        <p className="mt-2 text-sm text-slate-600">
          Раздел для сотрудников офиса: обновите контакты, краткую информацию о компании и базовые SEO-параметры.
        </p>

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
        ) : null}

        {searchParams?.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        ) : null}
      </section>

      <form action={saveSiteSettingsAction} className="space-y-6">
        {SITE_SETTINGS_SECTIONS.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{section.description}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.inputName} className="space-y-1">
                  <label htmlFor={field.inputName} className="text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    id={field.inputName}
                    name={field.inputName}
                    defaultValue={String(existingMap.get(field.key)?.value ?? '')}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  {field.helper ? <p className="text-xs text-slate-500">{field.helper}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ))}

        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Сохранить
        </button>
      </form>
    </div>
  );
}

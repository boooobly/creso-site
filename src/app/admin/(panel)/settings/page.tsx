import { AdminAlert } from '@/components/admin/ui';
import { saveSiteSettingsAction } from './actions';
import SubmitSettingsButton from './SubmitSettingsButton';
import { SITE_SETTINGS_SECTIONS, type SiteSettingFieldDefinition } from '@/lib/admin/site-settings-config';
import { listSiteSettingsByKeys } from '@/lib/admin/site-settings-service';

type AdminSettingsPageProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

const successMessages: Record<string, string> = {
  saved: 'Готово: настройки сохранены и уже применяются на сайте.',
};

function renderFieldInput(field: SiteSettingFieldDefinition, value: string) {
  const commonClassName = 'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm';

  if (field.control === 'textarea') {
    return (
      <textarea
        id={field.inputName}
        name={field.inputName}
        rows={4}
        defaultValue={value}
        placeholder={field.placeholder}
        className={commonClassName}
      />
    );
  }

  return (
    <input
      id={field.inputName}
      name={field.inputName}
      type={field.control ?? 'text'}
      defaultValue={value}
      placeholder={field.placeholder}
      className={commonClassName}
    />
  );
}

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const keys = SITE_SETTINGS_SECTIONS.flatMap((section) => section.fields.map((field) => field.key));
  const existingMap = await listSiteSettingsByKeys(keys);
  const successMessage = resolvedSearchParams?.success ? successMessages[resolvedSearchParams.success] : null;

  const totalFields = SITE_SETTINGS_SECTIONS.reduce((sum, section) => sum + section.fields.length, 0);
  const requiredFields = SITE_SETTINGS_SECTIONS.flatMap((section) => section.fields).filter((field) => field.required).length;

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900">Настройки компании и сайта</h1>
        <p className="mt-2 text-sm text-slate-600">
          Меняйте контакты и общие данные сайта в простом формате. Технические детали скрыты — можно работать спокойно.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Разделов: {SITE_SETTINGS_SECTIONS.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Полей: {totalFields}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Обязательных: {requiredFields}</span>
        </div>

        {successMessage ? (
          <AdminAlert tone="success" role="status" className="mt-4">{successMessage}</AdminAlert>
        ) : null}

        {resolvedSearchParams?.error ? (
          <AdminAlert tone="error" role="alert" className="mt-4">Не удалось сохранить изменения. Проверьте поле и попробуйте ещё раз: {resolvedSearchParams.error}</AdminAlert>
        ) : null}
      </section>

      <form action={saveSiteSettingsAction} className="space-y-4 lg:space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-slate-900">Быстрый переход по разделам</h2>
          <p className="mt-1 text-sm text-slate-600">Откройте нужный блок и внесите изменения.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SITE_SETTINGS_SECTIONS.map((section, index) => (
              <a
                key={section.title}
                href={`#settings-section-${index}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 no-underline hover:border-slate-300"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </div>
        </section>

        {SITE_SETTINGS_SECTIONS.map((section, sectionIndex) => (
          <section
            id={`settings-section-${sectionIndex}`}
            key={section.title}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4 border-b border-slate-200 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Раздел {sectionIndex + 1}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{section.description}</p>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {section.fields.map((field) => {
                const value = String(existingMap.get(field.key)?.value ?? '');
                const isLongField = field.control === 'textarea';

                return (
                  <div
                    key={field.inputName}
                    className={`${isLongField ? 'md:col-span-2' : ''} rounded-lg border px-3 py-3 ${
                      field.caution ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={field.inputName} className="text-sm font-medium text-slate-700">
                        {field.label}
                      </label>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${field.required ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {field.required ? 'Обязательно' : 'Необязательно'}
                      </span>
                    </div>

                    {renderFieldInput(field, value)}

                    {field.helper ? <p className="mt-1.5 text-xs text-slate-500">{field.helper}</p> : null}
                    {field.appearsIn ? <p className="mt-1 text-xs text-slate-500">На сайте: {field.appearsIn}.</p> : null}
                    {field.caution ? (
                      <p className="mt-1 text-xs text-amber-700">Изменяйте аккуратно: этот параметр влияет на вид сайта в поиске и соцсетях.</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="sticky bottom-3 z-10 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-600">Проверьте важные поля (телефон, email, название) и нажмите «Сохранить настройки».</p>
            <SubmitSettingsButton />
          </div>
        </div>
      </form>
    </div>
  );
}

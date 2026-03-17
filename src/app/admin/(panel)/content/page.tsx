import { savePageContentAction } from './actions';
import { PAGE_CONTENT_DEFINITIONS, type PageContentListSchema } from '@/lib/admin/page-content-config';
import { listPageContentByPageKey, toPageContentStringMap } from '@/lib/admin/page-content-service';

type AdminContentPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
    page?: string;
  };
};

const successMessages: Record<string, string> = {
  saved: 'Изменения сохранены. Текст на сайте обновится автоматически.'
};

function parseListValue(rawValue: string | undefined, schema: PageContentListSchema) {
  if (!rawValue) return [] as Array<Record<string, string>>;

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const record = item as Record<string, unknown>;
        const next: Record<string, string> = {};

        for (const field of schema.fields) {
          const value = record[field.key];
          next[field.key] = typeof value === 'string' ? value : '';
        }

        return next;
      });
  } catch {
    return [];
  }
}

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const currentPageKey =
    searchParams?.page && PAGE_CONTENT_DEFINITIONS.some((item) => item.key === searchParams.page)
      ? searchParams.page
      : PAGE_CONTENT_DEFINITIONS[0]?.key;

  const currentPage = PAGE_CONTENT_DEFINITIONS.find((item) => item.key === currentPageKey) ?? PAGE_CONTENT_DEFINITIONS[0];
  const existingItems = await listPageContentByPageKey(currentPage.key).catch(() => []);
  const existingMap = toPageContentStringMap(existingItems);
  const successMessage = searchParams?.success ? successMessages[searchParams.success] : null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900">Контент страниц</h1>
        <p className="mt-2 text-sm text-slate-600">
          Редактируйте тексты по страницам и блокам: заголовки, описания, кнопки, FAQ и CTA.
        </p>

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
        ) : null}

        {searchParams?.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Выбор страницы</h2>
        <p className="mt-1 text-sm text-slate-600">Выберите страницу, которую хотите обновить.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PAGE_CONTENT_DEFINITIONS.map((page) => (
            <a
              key={page.key}
              href={`/admin/content?page=${page.key}`}
              className={`rounded-full border px-3 py-1.5 text-sm no-underline transition ${
                page.key === currentPage.key
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {page.title}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">{currentPage.title}</h2>
          <p className="text-sm text-slate-600">Публичный адрес: {currentPage.route}</p>
        </div>

        <form action={savePageContentAction} className="space-y-6">
          <input type="hidden" name="pageKey" value={currentPage.key} />

          {currentPage.sections.map((section) => (
            <div key={section.key} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
              {section.description ? <p className="mt-1 text-sm text-slate-600">{section.description}</p> : null}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => {
                  const inputName = `${field.sectionKey}__${field.fieldKey}`;
                  const defaultValue = existingMap.get(`${field.sectionKey}.${field.fieldKey}`) ?? field.defaultValue;

                  if (field.type === 'list' && field.listSchema) {
                    const listSchema = field.listSchema;
                    const existingItems = parseListValue(defaultValue, listSchema);
                    const preparedItems = existingItems.length > 0 ? existingItems : parseListValue(field.defaultValue, listSchema);
                    const minItems = listSchema.minItems ?? 1;
                    const maxItems = listSchema.maxItems ?? Math.max(preparedItems.length, minItems);
                    const itemCount = Math.max(minItems, preparedItems.length, 1);
                    const rows = Array.from({ length: maxItems }).map((_, index) => preparedItems[index] ?? {});

                    return (
                      <div key={inputName} className="space-y-3 md:col-span-2">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{field.label}</p>
                          {field.helper ? <p className="text-xs text-slate-500">{field.helper}</p> : null}
                        </div>
                        <input type="hidden" name={`${inputName}__count`} value={rows.length} />
                        <div className="space-y-3">
                          {rows.map((item, rowIndex) => (
                            <div key={`${inputName}-${rowIndex}`} className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {listSchema.itemName} {rowIndex + 1}
                              </p>
                              <div className="grid gap-3 md:grid-cols-2">
                                {listSchema.fields.map((listField) => {
                                  const listInputName = `${inputName}__${rowIndex}__${listField.key}`;
                                  const isDescriptionField = /description|answer/i.test(listField.key);

                                  return (
                                    <div key={listInputName} className={isDescriptionField ? 'space-y-1 md:col-span-2' : 'space-y-1'}>
                                      <label htmlFor={listInputName} className="text-xs font-medium text-slate-700">
                                        {listField.label}
                                      </label>
                                      {isDescriptionField ? (
                                        <textarea
                                          id={listInputName}
                                          name={listInputName}
                                          rows={3}
                                          defaultValue={item[listField.key] ?? ''}
                                          placeholder={listField.placeholder}
                                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                        />
                                      ) : (
                                        <input
                                          id={listInputName}
                                          name={listInputName}
                                          defaultValue={item[listField.key] ?? ''}
                                          placeholder={listField.placeholder}
                                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Заполненные пункты сохраняются. Пустые карточки пропускаются автоматически.
                          {maxItems > itemCount ? ` Максимум: ${maxItems}.` : null}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div key={inputName} className={field.type === 'textarea' ? 'space-y-1 md:col-span-2' : 'space-y-1'}>
                      <label htmlFor={inputName} className="text-sm font-medium text-slate-700">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          id={inputName}
                          name={inputName}
                          rows={3}
                          defaultValue={defaultValue}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      ) : (
                        <input
                          id={inputName}
                          name={inputName}
                          defaultValue={defaultValue}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      )}
                      {field.helper ? <p className="text-xs text-slate-500">{field.helper}</p> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Сохранить
          </button>
        </form>
      </section>
    </div>
  );
}

import { AdminAlert } from '@/components/admin/ui';
import { savePageContentAction } from './actions';
import { PAGE_CONTENT_DEFINITIONS, type PageContentListSchema } from '@/lib/admin/page-content-config';
import { listPageContentByPageKey, toPageContentStringMap } from '@/lib/admin/page-content-service';
import SubmitContentButton from './SubmitContentButton';

type AdminContentPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
    page?: string;
  };
};

const successMessages: Record<string, string> = {
  saved: 'Готово! Изменения сохранены и уже применяются на сайте.'
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

function getFriendlyFieldLabel(fieldKey: string, fallback: string) {
  const labelMap: Record<string, string> = {
    eyebrow: 'Короткая подпись над заголовком',
    title: 'Заголовок блока',
    description: 'Текст блока',
    buttonText: 'Текст кнопки',
    primaryButtonText: 'Текст основной кнопки',
    secondaryButtonText: 'Текст второй кнопки',
    question: 'Вопрос',
    answer: 'Ответ',
    label: 'Текст элемента',
  };

  return labelMap[fieldKey] ?? fallback;
}

function getFieldUsageHint(sectionTitle: string, fieldKey: string) {
  if (fieldKey.includes('button')) return 'Важно: это подпись, которую пользователь увидит прямо на кнопке.';
  if (fieldKey === 'title') return `Показывается как главный заголовок в блоке «${sectionTitle}».`;
  if (fieldKey === 'description') return `Показывается как основной поясняющий текст блока «${sectionTitle}».`;
  if (fieldKey === 'answer') return 'Это подробный ответ, который раскрывается под вопросом FAQ.';
  if (fieldKey === 'question') return 'Короткий и понятный заголовок пункта FAQ.';

  return null;
}

function isPriorityField(fieldKey: string) {
  return fieldKey.includes('button') || fieldKey === 'title' || fieldKey === 'question';
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
    <div className="space-y-5 pb-8 lg:space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900">Редактор текстов сайта</h1>
        <p className="mt-2 text-sm text-slate-600">
          Меняйте текст по страницам в спокойном формате: заголовки, описания, кнопки, FAQ и CTA-блоки.
        </p>

        {successMessage ? (
          <AdminAlert tone="success" role="status" className="mt-4">{successMessage}</AdminAlert>
        ) : null}

        {searchParams?.error ? (
          <AdminAlert tone="error" role="alert" className="mt-4">Не удалось сохранить: {searchParams.error}</AdminAlert>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">1. Выберите страницу</h2>
        <p className="mt-1 text-sm text-slate-600">Откройте страницу, на которой хотите поменять текст.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PAGE_CONTENT_DEFINITIONS.map((page) => (
            <a
              key={page.key}
              href={`/admin/content?page=${page.key}`}
              className={`rounded-xl border p-4 no-underline transition ${
                page.key === currentPage.key
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className={`text-sm font-semibold ${page.key === currentPage.key ? 'text-white' : 'text-slate-900'}`}>{page.title}</p>
              <p className={`mt-1 text-xs ${page.key === currentPage.key ? 'text-slate-100' : 'text-slate-500'}`}>Адрес страницы: {page.route}</p>
              <p className={`mt-2 text-xs ${page.key === currentPage.key ? 'text-slate-200' : 'text-slate-500'}`}>
                Разделов в редакторе: {page.sections.length}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">2. Вы редактируете страницу</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{currentPage.title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Публичный адрес: <span className="rounded bg-white px-2 py-0.5 font-mono text-xs text-slate-700">{currentPage.route}</span>
          </p>
        </div>

        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Быстрый переход по блокам страницы</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {currentPage.sections.map((section, index) => (
              <a
                key={section.key}
                href={`#section-${section.key}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 no-underline hover:border-slate-300"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </div>
        </div>

        <form action={savePageContentAction} className="space-y-5 lg:space-y-6">
          <input type="hidden" name="pageKey" value={currentPage.key} />

          {currentPage.sections.map((section, sectionIndex) => (
            <div id={`section-${section.key}`} key={section.key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Блок {sectionIndex + 1}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {section.description ?? `Текст этого блока отображается на странице «${currentPage.title}».`}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => {
                  const inputName = `${field.sectionKey}__${field.fieldKey}`;
                  const defaultValue = existingMap.get(`${field.sectionKey}.${field.fieldKey}`) ?? field.defaultValue;
                  const fieldLabel = getFriendlyFieldLabel(field.fieldKey, field.label);
                  const fieldHint = getFieldUsageHint(section.title, field.fieldKey);
                  const priorityField = isPriorityField(field.fieldKey);

                  if (field.type === 'list' && field.listSchema) {
                    const listSchema = field.listSchema;
                    const existingListItems = parseListValue(defaultValue, listSchema);
                    const preparedItems = existingListItems.length > 0 ? existingListItems : parseListValue(field.defaultValue, listSchema);
                    const minItems = listSchema.minItems ?? 1;
                    const maxItems = listSchema.maxItems ?? Math.max(preparedItems.length, minItems);
                    const nextRowCount = preparedItems.length < maxItems ? 1 : 0;
                    const rowCount = Math.max(minItems, preparedItems.length + nextRowCount, 1);
                    const rows = Array.from({ length: rowCount }).map((_, index) => preparedItems[index] ?? {});

                    return (
                      <div key={inputName} className="space-y-3 md:col-span-2">
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                          <p className="text-sm font-semibold text-slate-800">{fieldLabel}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {field.helper ?? 'Редактируйте карточки по порядку. На сайте они будут в таком же порядке сверху вниз.'}
                          </p>
                        </div>

                        <input type="hidden" name={`${inputName}__count`} value={rows.length} />
                        <div className="space-y-3">
                          {rows.map((item, rowIndex) => {
                            const isEmptyRow = listSchema.fields.every((listField) => !(item[listField.key] ?? '').trim());

                            return (
                              <div
                                key={`${inputName}-${rowIndex}`}
                                className={`rounded-lg border p-4 ${
                                  isEmptyRow ? 'border-dashed border-slate-300 bg-white' : 'border-slate-200 bg-white'
                                }`}
                              >
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  {isEmptyRow ? `Новый ${listSchema.itemName.toLowerCase()}` : `${listSchema.itemName} ${rowIndex + 1}`}
                                </p>

                                <div className="grid gap-3 md:grid-cols-2">
                                  {listSchema.fields.map((listField) => {
                                    const listInputName = `${inputName}__${rowIndex}__${listField.key}`;
                                    const isLongTextField = /description|answer/i.test(listField.key);
                                    const listFieldLabel = getFriendlyFieldLabel(listField.key, listField.label);

                                    return (
                                      <div key={listInputName} className={isLongTextField ? 'space-y-1 md:col-span-2' : 'space-y-1'}>
                                        <label htmlFor={listInputName} className="text-xs font-medium text-slate-700">
                                          {listFieldLabel}
                                        </label>
                                        {isLongTextField ? (
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
                            );
                          })}
                        </div>

                        <p className="text-xs text-slate-500">
                          Пустая «Новая» карточка не сохранится. Чтобы добавить пункт, заполните её и нажмите «Сохранить изменения».
                          {maxItems > rowCount ? ` Максимум карточек: ${maxItems}.` : null}
                        </p>
                      </div>
                    );
                  }

                  const isLongTextField = field.type === 'textarea' || /description|answer/i.test(field.fieldKey);

                  return (
                    <div
                      key={inputName}
                      className={`${isLongTextField ? 'md:col-span-2' : ''} rounded-lg border px-3 py-3 ${
                        priorityField ? 'border-slate-300 bg-white' : 'border-slate-200 bg-white/80'
                      }`}
                    >
                      <label htmlFor={inputName} className="text-sm font-medium text-slate-700">
                        {fieldLabel}
                      </label>
                      {isLongTextField ? (
                        <textarea
                          id={inputName}
                          name={inputName}
                          rows={4}
                          defaultValue={defaultValue}
                          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      ) : (
                        <input
                          id={inputName}
                          name={inputName}
                          defaultValue={defaultValue}
                          placeholder={field.defaultValue}
                          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      )}
                      {field.helper || fieldHint ? <p className="mt-1 text-xs text-slate-500">{field.helper ?? fieldHint}</p> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="sticky bottom-3 z-10 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-600">3. Сохраните изменения. После сохранения тексты на сайте обновятся автоматически.</p>
              <SubmitContentButton />
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

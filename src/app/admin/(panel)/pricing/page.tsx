import { listPriceCatalog } from '@/lib/admin/price-catalog-service';
import { listBaguetteExtrasPricingAdminData } from '@/lib/admin/baguette-extras-pricing-service';
import ConfirmSubmitButton from '@/components/admin/pricing/ConfirmSubmitButton';
import {
  createPriceCategoryAction,
  createPriceItemAction,
  deletePriceCategoryAction,
  deletePriceItemAction,
  updateBaguetteExtrasPricingEntryAction,
  updatePriceCategoryAction,
  updatePriceItemAction,
} from './actions';

const successMessages: Record<string, string> = {
  'category-created': 'Категория успешно создана.',
  'category-updated': 'Категория успешно обновлена.',
  'category-deleted': 'Категория удалена.',
  'item-created': 'Позиция успешно добавлена.',
  'item-updated': 'Позиция успешно обновлена.',
  'item-deleted': 'Позиция удалена.',
  'baguette-config-updated': 'Конфигурация доп. материалов багета обновлена.',
};

type AdminPricingPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

export default async function AdminPricingPage({ searchParams }: AdminPricingPageProps) {
  const [categories, baguetteConfigData] = await Promise.all([
    listPriceCatalog(),
    listBaguetteExtrasPricingAdminData(),
  ]);
  const successMessage = searchParams?.success ? successMessages[searchParams.success] : null;

  const baguetteCategories = categories.filter((category) => category.kind === 'baguette_extras');
  const generalCategories = categories.filter((category) => category.kind !== 'baguette_extras');

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900">Управление ценами</h1>
        <p className="mt-2 text-sm text-slate-600">
          Удобное редактирование цен для сотрудников офиса: категории, позиции, порядок показа и видимость на сайте.
        </p>

        <div className="mt-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Важно: багет и Google Sheets</p>
          <p className="mt-1 text-sm text-amber-800">
            Цены на сам багет и карточки багета редактируются в Google Sheets. Здесь редактируются только
            дополнительные материалы: стекло, ПВХ, паспарту, печать, картон, подвесы, задники и другие доп. опции.
          </p>
        </div>

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
        ) : null}

        {searchParams?.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        ) : null}
      </section>

      <BaguetteExtrasConfigSection
        entries={baguetteConfigData.entries}
        histories={baguetteConfigData.histories}
        fallbackUsedKeys={baguetteConfigData.fallbackUsedKeys}
        missingKeys={baguetteConfigData.missingKeys}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Добавить категорию</h2>
        <p className="mt-1 text-sm text-slate-600">Создайте раздел, в котором сотрудники будут вести цены.</p>

        <form action={createPriceCategoryAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-category-name">Название</label>
            <input
              id="new-category-name"
              name="name"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Например: Широкоформатная печать"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-category-kind">Тип категории</label>
            <select
              id="new-category-kind"
              name="kind"
              defaultValue="general"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="general">Обычная категория</option>
              <option value="baguette_extras">Доп. материалы для багета</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-category-description">Описание</label>
            <textarea
              id="new-category-description"
              name="description"
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Короткая подсказка для сотрудников"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-category-order">Порядок</label>
            <input
              id="new-category-order"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
            Показывать на сайте
          </label>

          <div className="md:col-span-2">
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Добавить категорию
            </button>
          </div>
        </form>
      </section>

      {categories.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          Пока нет категорий цен. Добавьте первую категорию выше.
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Категории для сайта</h2>
        {generalCategories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Обычные категории пока не созданы.
          </p>
        ) : (
          generalCategories.map((category) => <CategoryCard key={category.id} category={category} />)
        )}
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <h2 className="text-lg font-semibold text-amber-900">Дополнительные материалы для багета</h2>
          <p className="mt-1 text-sm text-amber-800">
            Этот блок только для доп. материалов (стекло, ПВХ, паспарту, картон, подвесы, задники и т.д.).
            Каталог багета и базовые цены рам управляются только в Google Sheets.
          </p>
        </div>

        {baguetteCategories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Пока нет категорий доп. материалов для багета. Добавьте категорию с типом «Доп. материалы для багета».
          </p>
        ) : (
          baguetteCategories.map((category) => <CategoryCard key={category.id} category={category} />)
        )}
      </section>
    </div>
  );
}

type Category = Awaited<ReturnType<typeof listPriceCatalog>>[number];

function CategoryCard({ category }: { category: Category }) {
  const updateCategory = updatePriceCategoryAction.bind(null, category.id);
  const removeCategory = deletePriceCategoryAction.bind(null, category.id);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
        {category.kind === 'baguette_extras' ? (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
            Доп. материалы багета
          </span>
        ) : null}
        {!category.isActive ? (
          <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">Скрыта на сайте</span>
        ) : null}
      </div>

      <form action={updateCategory} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <input type="hidden" name="slug" defaultValue={category.slug} />

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Название</label>
          <input name="name" required defaultValue={category.name} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Тип категории</label>
          <select name="kind" defaultValue={category.kind} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="general">Обычная категория</option>
            <option value="baguette_extras">Доп. материалы для багета</option>
          </select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Описание</label>
          <textarea name="description" rows={2} defaultValue={category.description ?? ''} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Порядок</label>
          <input name="sortOrder" type="number" min={0} defaultValue={category.sortOrder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={category.isActive} className="h-4 w-4" />
          Показывать на сайте
        </label>

        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Сохранить
          </button>
        </div>
      </form>

      <ConfirmSubmitButton
        action={removeCategory}
        confirmText="Удалить категорию? Если в ней есть позиции, удаление будет запрещено."
        idleLabel="Удалить"
        pendingLabel="Удаляем..."
        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-800">Позиции в категории</h4>

        {category.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            В этой категории пока нет позиций.
          </p>
        ) : null}

        {category.items.map((item) => {
          const updateItem = updatePriceItemAction.bind(null, item.id);
          const removeItem = deletePriceItemAction.bind(null, item.id);

          return (
            <div key={item.id} className="space-y-2 rounded-lg border border-slate-200 p-4">
              <form action={updateItem} className="grid gap-3 md:grid-cols-6">
                <input type="hidden" name="categoryId" value={category.id} />

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-slate-600">Название</label>
                  <input name="title" required defaultValue={item.title} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Цена</label>
                  <input
                    name="price"
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={item.price.toString()}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Единица</label>
                  <input name="unit" required defaultValue={item.unit} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="₽/шт" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Порядок</label>
                  <input name="sortOrder" type="number" min={0} defaultValue={item.sortOrder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>

                <label className="inline-flex items-center gap-2 self-end text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked={item.isActive} className="h-4 w-4" />
                  Показывать на сайте
                </label>

                <div className="space-y-1 md:col-span-4">
                  <label className="text-xs font-medium text-slate-600">Описание</label>
                  <input
                    name="description"
                    defaultValue={item.description ?? ''}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Краткий комментарий для сотрудников"
                  />
                </div>

                <div className="md:col-span-2 flex items-end justify-end">
                  <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                    Сохранить
                  </button>
                </div>
              </form>

              <ConfirmSubmitButton
                action={removeItem}
                confirmText="Удалить эту позицию? Действие нельзя отменить."
                idleLabel="Удалить"
                pendingLabel="Удаляем..."
                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              />
            </div>
          );
        })}

        <form action={createPriceItemAction} className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 md:grid-cols-6">
          <input type="hidden" name="categoryId" value={category.id} />

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-700">Название</label>
            <input name="title" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Новая позиция" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Цена</label>
            <input name="price" required type="number" min={0} step="0.01" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Единица</label>
            <input name="unit" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="₽/шт" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Порядок</label>
            <input name="sortOrder" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <label className="inline-flex items-center gap-2 self-end text-sm text-slate-700">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
            Показывать на сайте
          </label>

          <div className="space-y-1 md:col-span-4">
            <label className="text-xs font-medium text-slate-700">Описание</label>
            <input name="description" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Например: опция к заказу" />
          </div>

          <div className="md:col-span-2 flex items-end justify-end">
            <button type="submit" className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
              Добавить позицию
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function BaguetteExtrasConfigSection({
  entries,
  histories,
  fallbackUsedKeys,
  missingKeys,
}: {
  entries: Array<{
    id: string;
    label: string;
    key: string;
    subcategory: string;
    type: string;
    unit: string | null;
    value: unknown;
    description: string;
  }>;
  histories: Array<{
    id: string;
    key: string;
    subcategory: string;
    oldValue: unknown;
    newValue: unknown;
    createdAt: Date;
    note: string | null;
  }>;
  fallbackUsedKeys: Array<{ key: string; reason: string }>;
  missingKeys: string[];
}) {
  const subgroupLabels: Record<string, string> = {
    materials: 'Материалы и доп. элементы',
    print: 'Печать в багетном калькуляторе',
    hanging: 'Подвесы и тросики',
    stand: 'Подставка',
    stretcher: 'Подрамник',
    auto_additions: 'Автодобавления по типу работ',
  };

  const groupedEntries = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const subgroup = entry.subcategory;
    if (!acc[subgroup]) acc[subgroup] = [];
    acc[subgroup].push(entry);
    return acc;
  }, {});

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Конфигурация расчёта багета (источник цены)</h2>
      <p className="text-sm text-slate-600">Редактируются только не-багетные значения калькулятора: материалы, печать, подвесы, подрамник, пороги и автодобавления.</p>

      {fallbackUsedKeys.length > 0 ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Используются fallback-значения для ключей: {fallbackUsedKeys.map((item) => `${item.key} (${item.reason})`).join(', ')}
        </div>
      ) : null}

      {missingKeys.length > 0 ? (
        <div className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-900">
          В БД отсутствуют активные ключи: {missingKeys.join(', ')}
        </div>
      ) : null}

      <div className="space-y-4">
        {Object.entries(groupedEntries).map(([subgroup, subgroupEntries]) => (
          <div key={subgroup} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">{subgroupLabels[subgroup] ?? subgroup}</h3>
            {subgroupEntries.map((entry) => {
              const action = updateBaguetteExtrasPricingEntryAction.bind(null, entry.id);
              const formattedValue = entry.type === 'number'
                ? String(entry.value)
                : JSON.stringify(entry.value, null, 2);

              return (
                <form key={entry.id} action={action} className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-6">
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                    <p className="text-xs text-slate-500">{entry.subcategory}.{entry.key}</p>
                    {entry.description ? <p className="text-xs text-slate-500">{entry.description}</p> : null}
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-slate-600">Значение ({entry.type}{entry.unit ? `, ${entry.unit}` : ''})</label>
                    {entry.type === 'number' ? (
                      <input name="value" type="number" min={0} step="0.01" defaultValue={formattedValue} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    ) : (
                      <textarea name="value" rows={4} defaultValue={formattedValue} className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Комментарий (опционально)</label>
                    <input name="note" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Причина изменения" />
                  </div>

                  <div className="md:col-span-1 flex items-end justify-end">
                    <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                      Сохранить
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Последние изменения</h3>
        {histories.length === 0 ? <p className="text-sm text-slate-500">Изменений пока нет.</p> : null}
        {histories.slice(0, 20).map((history) => (
          <div key={history.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <p className="font-medium">{history.subcategory}.{history.key} · {history.createdAt.toLocaleString('ru-RU')}</p>
            <p>Было: <code>{JSON.stringify(history.oldValue)}</code></p>
            <p>Стало: <code>{JSON.stringify(history.newValue)}</code></p>
            {history.note ? <p>Комментарий: {history.note}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

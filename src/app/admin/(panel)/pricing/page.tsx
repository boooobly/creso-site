import { AdminAlert } from '@/components/admin/ui';
import ConfirmSubmitButton from '@/components/admin/pricing/ConfirmSubmitButton';
import { listBaguetteExtrasPricingAdminData } from '@/lib/admin/baguette-extras-pricing-service';
import { listPriceCatalog } from '@/lib/admin/price-catalog-service';
import { listHeatTransferPricingAdminData } from '@/lib/heat-transfer/heatTransferPricing';
import { listPlotterCuttingPricingAdminData } from '@/lib/plotter-cutting/plotterCuttingPricing';
import { listPrintPricingAdminData } from '@/lib/print/printPricing';
import { listMillingPricingAdminData } from '@/lib/milling/millingPricing';
import { listWideFormatPricingAdminData } from '@/lib/wide-format/wideFormatPricing';
import {
  createPriceCategoryAction,
  createPriceItemAction,
  deletePriceCategoryAction,
  deletePriceItemAction,
  updateBaguetteExtrasPricingEntryAction,
  updateHeatTransferPricingEntryAction,
  updatePlotterCuttingPricingEntryAction,
  updatePriceCategoryAction,
  updatePriceItemAction,
  updatePrintPricingEntryAction,
  updateWideFormatPricingEntryAction,
  updateMillingPricingEntryAction,
} from './actions';

const successMessages: Record<string, string> = {
  'category-created': 'Готово: категория добавлена.',
  'category-updated': 'Готово: категория обновлена.',
  'category-deleted': 'Готово: категория удалена.',
  'item-created': 'Готово: позиция добавлена.',
  'item-updated': 'Готово: позиция обновлена.',
  'item-deleted': 'Готово: позиция удалена.',
  'baguette-config-updated': 'Готово: настройки доп. материалов багета обновлены.',
  'wide-format-config-updated': 'Готово: настройки широкоформатной печати обновлены.',
  'plotter-cutting-config-updated': 'Готово: настройки плоттерной резки обновлены.',
  'heat-transfer-config-updated': 'Готово: настройки термопереноса обновлены.',
  'print-config-updated': 'Готово: настройки общей печати обновлены.',
  'milling-config-updated': 'Готово: настройки фрезеровки листовых материалов обновлены.',
};

const moduleNav = [
  { id: 'site-catalog', label: 'Категории для сайта' },
  { id: 'baguette-catalog', label: 'Багет: доп. материалы' },
  { id: 'baguette-extras', label: 'Багет: правила расчёта' },
  { id: 'wide-format', label: 'Широкоформатная печать' },
  { id: 'plotter-cutting', label: 'Плоттерная резка' },
  { id: 'heat-transfer', label: 'Термоперенос' },
  { id: 'print', label: 'Общая печать' },
  { id: 'milling', label: 'Фрезеровка листовых материалов' },
] as const;

type AdminPricingPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

type Category = Awaited<ReturnType<typeof listPriceCatalog>>[number];
type PriceItem = Category['items'][number];
type PricingHistoryItem = {
  id: string;
  subcategory: string;
  key: string;
  oldValue: unknown;
  newValue: unknown;
  note: string | null;
  createdAt: Date;
};
type ConfigEntry = {
  id: string;
  category: string;
  subcategory: string;
  key: string;
  label: string;
  description?: string;
  value: unknown;
  unit: string | null;
  type: 'number' | 'boolean' | string;
  sortOrder: number;
  isActive: boolean;
};
type ConfigSection = {
  id: string;
  title: string;
  description: string;
  entries: ConfigEntry[];
};
type ConfigAction = (entryId: string, formData: FormData) => Promise<void>;

type BaguetteMaterialRate = {
  areaPricePerM2: number;
  cuttingPricePerM: number;
};

type BaguetteAutoAdditionRule = {
  pvcType: 'none' | 'pvc3' | 'pvc4';
  addOrabond: boolean;
  forceCardboard: boolean;
  stretchingRequired: boolean;
  removeCardboard: boolean;
};

function formatNumber(value: number) {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 0,
    maximumFractionDigits: 2,
  });
}

function formatPrice(value: number) {
  return `${formatNumber(value)} ₽`;
}

function formatEntryValue(value: unknown, unit?: string | null) {
  if (typeof value === 'number') {
    return unit === '₽' ? formatPrice(value) : `${formatNumber(value)}${unit ? ` ${unit}` : ''}`;
  }

  if (typeof value === 'boolean') {
    return value ? 'Да' : 'Нет';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

function formatHistoryValue(value: unknown) {
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function isBaguetteMaterialRate(value: unknown): value is BaguetteMaterialRate {
  return typeof value === 'object'
    && value !== null
    && 'areaPricePerM2' in value
    && 'cuttingPricePerM' in value;
}

function isBaguetteAutoAdditionRule(value: unknown): value is BaguetteAutoAdditionRule {
  return typeof value === 'object'
    && value !== null
    && 'pvcType' in value
    && 'addOrabond' in value
    && 'forceCardboard' in value
    && 'stretchingRequired' in value
    && 'removeCardboard' in value;
}

function getEntryInputHint(entry: ConfigEntry) {
  if (entry.type === 'boolean') {
    return 'Переключатель влияет только на показ материала в публичном конструкторе и не удаляет цену из системы.';
  }

  if (entry.type !== 'number') {
    return 'Изменяйте только если понимаете правило расчёта. При необходимости оставьте комментарий для коллег.';
  }

  if (entry.unit) {
    return `Введите число. Единица измерения: ${entry.unit}.`;
  }

  return 'Введите число без букв и лишних символов.';
}

function getModuleHealthLabel(isComplete: boolean, missingKeys: string[], fallbackUsedKeys: Array<{ key: string; reason: string }>) {
  if (isComplete && fallbackUsedKeys.length === 0) return 'Все рабочие значения заполнены.';
  if (missingKeys.length > 0) return `Не хватает обязательных значений: ${missingKeys.length}.`;
  if (fallbackUsedKeys.length > 0) return 'Есть значения, которые сейчас берутся из резервной конфигурации.';
  return 'Нужна проверка конфигурации.';
}

export default async function AdminPricingPage({ searchParams }: AdminPricingPageProps) {
  const [categories, baguetteConfigData, wideFormatConfigData, plotterCuttingConfigData, heatTransferConfigData, printConfigData, millingConfigData] = await Promise.all([
    listPriceCatalog(),
    listBaguetteExtrasPricingAdminData(),
    listWideFormatPricingAdminData(),
    listPlotterCuttingPricingAdminData(),
    listHeatTransferPricingAdminData(),
    listPrintPricingAdminData(),
    listMillingPricingAdminData(),
  ]);

  const successMessage = searchParams?.success ? successMessages[searchParams.success] : null;
  const baguetteCategories = categories.filter((category) => category.kind === 'baguette_extras');
  const generalCategories = categories.filter((category) => category.kind !== 'baguette_extras');
  const totalEditableItems = categories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Админка · цены</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Редактор цен для офиса</h1>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Раздел перестроен как простой редактор услуг: сначала видно понятные категории и названия для сотрудников,
              а технические коды и служебные проверки убраны в дополнительные блоки.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[440px]">
            <OverviewCard label="Категорий" value={String(categories.length)} helper="Отдельные блоки сайта и калькуляторов" />
            <OverviewCard label="Редактируемых позиций" value={String(totalEditableItems)} helper="Цены и параметры, доступные сотрудникам" />
            <OverviewCard label="Багет" value="Внешнее управление" helper="Каталог багета и базовые цены рамок здесь не меняются" tone="amber" />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Важно: каталог багета и базовые цены рамок остаются внешними.</p>
          <p className="mt-1 leading-6 text-amber-800">
            В этом разделе редактируются только дополнительные материалы и правила расчёта. Сами багеты,
            карточки багета и базовые цены рам по-прежнему управляются через Google Sheets.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Что было упрощено на этой странице</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• Системные ключи и внутренние коды больше не занимают основное место — они спрятаны в блок «Технические детали».</li>
              <li>• Длинный экран разбит на понятные разделы с навигацией и подзаголовками по услугам.</li>
              <li>• Для сложных багетных правил вместо JSON теперь используются обычные поля, переключатели и выпадающие списки.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Как вносить изменения</p>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>1. Перейдите к нужной услуге по кнопкам ниже.</li>
              <li>2. Измените понятное название, цену или правило.</li>
              <li>3. При необходимости оставьте комментарий и нажмите «Сохранить».</li>
            </ol>
          </div>
        </div>

        {successMessage ? (
          <AdminAlert tone="success" className="mt-5">{successMessage}</AdminAlert>
        ) : null}

        {searchParams?.error ? (
          <AdminAlert tone="error" className="mt-5">{searchParams.error}</AdminAlert>
        ) : null}
      </section>

      <nav className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Навигация по разделам цен">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Быстрая навигация</p>
            <p className="text-xs text-slate-500">Перейдите сразу к нужной услуге или разделу сайта.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {moduleNav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <CatalogSection
        id="site-catalog"
        title="Категории и цены для сайта"
        description="Обычные прайс-категории с названиями, описаниями и ценами, которые видят сотрудники и посетители сайта."
        categories={generalCategories}
        emptyMessage="Обычные категории пока не созданы."
        creationKind="general"
      />

      <CatalogSection
        id="baguette-catalog"
        title="Дополнительные материалы для багета"
        description="Только доплаты и дополнительные позиции для багетных заказов. Базовый каталог багета здесь не редактируется."
        categories={baguetteCategories}
        emptyMessage="Пока нет категорий доп. материалов для багета."
        creationKind="baguette_extras"
        accent="amber"
      />

      <BaguetteExtrasConfigSection
        histories={baguetteConfigData.histories}
        fallbackUsedKeys={baguetteConfigData.fallbackUsedKeys}
        missingKeys={baguetteConfigData.missingKeys}
        unknownKeys={baguetteConfigData.unknownKeys}
        isComplete={baguetteConfigData.isComplete}
        groupedSections={baguetteConfigData.groupedSections}
      />

      <ConfigModuleSection
        id="wide-format"
        title="Широкоформатная печать"
        description="Стоимость печати, дополнительные работы, ограничения по ширине и показ материалов в публичном конструкторе."
        audienceNote="Используйте этот блок для изменения прайса услуг, производственных ограничений и списка материалов, которые видят клиенты."
        histories={wideFormatConfigData.histories}
        fallbackUsedKeys={wideFormatConfigData.fallbackUsedKeys}
        missingKeys={wideFormatConfigData.missingKeys}
        unknownKeys={wideFormatConfigData.unknownKeys}
        isComplete={wideFormatConfigData.isComplete}
        groupedSections={wideFormatConfigData.groupedSections}
        updateAction={updateWideFormatPricingEntryAction}
      />

      <ConfigModuleSection
        id="plotter-cutting"
        title="Плоттерная резка"
        description="Базовые ставки, срочность, минимальный чек и сопутствующие работы по резке."
        audienceNote="Здесь удобно поддерживать стоимость резки, выборки и монтажа без погружения в системные ключи."
        histories={plotterCuttingConfigData.histories}
        fallbackUsedKeys={plotterCuttingConfigData.fallbackUsedKeys}
        missingKeys={plotterCuttingConfigData.missingKeys}
        unknownKeys={plotterCuttingConfigData.unknownKeys}
        isComplete={plotterCuttingConfigData.isComplete}
        groupedSections={plotterCuttingConfigData.groupedSections}
        updateAction={updatePlotterCuttingPricingEntryAction}
      />

      <ConfigModuleSection
        id="heat-transfer"
        title="Термоперенос"
        description="Кружки, футболки, термоплёнка, скидки по тиражу и минимальные суммы заказа."
        audienceNote="Раздел разбит по типам услуг, чтобы сотрудник сразу видел, на что повлияет изменение цены."
        histories={heatTransferConfigData.histories}
        fallbackUsedKeys={heatTransferConfigData.fallbackUsedKeys}
        missingKeys={heatTransferConfigData.missingKeys}
        unknownKeys={heatTransferConfigData.unknownKeys}
        isComplete={heatTransferConfigData.isComplete}
        groupedSections={heatTransferConfigData.groupedSections}
        updateAction={updateHeatTransferPricingEntryAction}
      />

      <ConfigModuleSection
        id="print"
        title="Общая печать"
        description="Минимальный тираж, базовые ставки и коэффициенты для визиток и флаеров."
        audienceNote="Коэффициенты сгруппированы отдельно от базовых цен, поэтому длинный технический список больше не выглядит как таблица записей."
        histories={printConfigData.histories}
        fallbackUsedKeys={printConfigData.fallbackUsedKeys}
        missingKeys={printConfigData.missingKeys}
        unknownKeys={printConfigData.unknownKeys}
        isComplete={printConfigData.isComplete}
        groupedSections={printConfigData.groupedSections}
        updateAction={updatePrintPricingEntryAction}
      />

      <ConfigModuleSection
        id="milling"
        title="Фрезеровка листовых материалов"
        description="Цены по материалам, минимальный заказ, срочность и сопутствующие услуги для листовой фрезеровки."
        audienceNote="Блок собран по понятным для офиса группам: отдельно материалы, отдельно срочность, подготовка и логистика."
        histories={millingConfigData.histories}
        fallbackUsedKeys={millingConfigData.fallbackUsedKeys}
        missingKeys={millingConfigData.missingKeys}
        unknownKeys={millingConfigData.unknownKeys}
        isComplete={millingConfigData.isComplete}
        groupedSections={millingConfigData.groupedSections}
        updateAction={updateMillingPricingEntryAction}
      />
    </div>
  );
}

function OverviewCard({
  label,
  value,
  helper,
  tone = 'slate',
}: {
  label: string;
  value: string;
  helper: string;
  tone?: 'slate' | 'amber';
}) {
  const toneClasses = tone === 'amber'
    ? 'border-amber-300 bg-amber-50 text-amber-900'
    : 'border-slate-200 bg-slate-50 text-slate-900';

  return (
    <div className={`rounded-xl border p-4 ${toneClasses}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs leading-5 opacity-80">{helper}</p>
    </div>
  );
}

function CatalogSection({
  id,
  title,
  description,
  categories,
  emptyMessage,
  creationKind,
  accent = 'slate',
}: {
  id: string;
  title: string;
  description: string;
  categories: Category[];
  emptyMessage: string;
  creationKind: 'general' | 'baguette_extras';
  accent?: 'slate' | 'amber';
}) {
  const accentClasses = accent === 'amber'
    ? 'border-amber-300 bg-amber-50 text-amber-900'
    : 'border-slate-200 bg-white text-slate-900';

  return (
    <section id={id} className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${accentClasses}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-current/80">{description}</p>
        </div>
        <div className="rounded-xl border border-current/15 bg-white/80 px-4 py-3 text-sm text-current/80">
          <p className="font-medium text-current">{categories.length} категорий</p>
          <p className="mt-1 text-xs">Сначала проверьте карточки ниже, затем при необходимости добавьте новую категорию.</p>
        </div>
      </div>

      <details className="mt-5 rounded-xl border border-current/15 bg-white/80 p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-current marker:hidden">
          Добавить новую категорию
        </summary>
        <form action={createPriceCategoryAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="kind" value={creationKind} />

          <div className="space-y-1">
            <label className="text-sm font-medium text-current" htmlFor={`${id}-new-category-name`}>Название категории</label>
            <input
              id={`${id}-new-category-name`}
              name="name"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder={creationKind === 'baguette_extras' ? 'Например: Стекло и крепёж' : 'Например: Печать документов'}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-current" htmlFor={`${id}-new-category-order`}>Порядок на странице</label>
            <input
              id={`${id}-new-category-order`}
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-current" htmlFor={`${id}-new-category-description`}>Короткая подсказка для сотрудников</label>
            <textarea
              id={`${id}-new-category-description`}
              name="description"
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="Напишите, что входит в эту категорию или для каких заказов она нужна."
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-current">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
            Показывать категорию на сайте
          </label>

          <div>
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Добавить категорию
            </button>
          </div>
        </form>
      </details>

      <div className="mt-5 space-y-4">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-current/20 bg-white/70 px-4 py-4 text-sm text-current/80">
            {emptyMessage}
          </div>
        ) : (
          categories.map((category) => <CategoryCard key={category.id} category={category} accent={accent} />)
        )}
      </div>
    </section>
  );
}

function CategoryCard({ category, accent }: { category: Category; accent: 'slate' | 'amber' }) {
  const updateCategory = updatePriceCategoryAction.bind(null, category.id);
  const removeCategory = deletePriceCategoryAction.bind(null, category.id);
  const visibleItemsCount = category.items.filter((item) => item.isActive).length;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
            {category.kind === 'baguette_extras' ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">Доп. материалы багета</span>
            ) : null}
            {category.isActive ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Показывается на сайте</span>
            ) : (
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">Скрыта на сайте</span>
            )}
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {category.description?.trim() || 'Описание не заполнено. Добавьте короткую подсказку, чтобы коллегам было понятно, для каких услуг эта категория.'}
          </p>
        </div>

        <div className={`grid gap-2 rounded-xl border p-4 text-sm ${accent === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
          <p><span className="font-semibold">Позиции:</span> {category.items.length}</p>
          <p><span className="font-semibold">Активные:</span> {visibleItemsCount}</p>
          <p><span className="font-semibold">Порядок:</span> {category.sortOrder}</p>
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">Настройки категории</summary>
        <form action={updateCategory} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="slug" defaultValue={category.slug} />
          <input type="hidden" name="kind" defaultValue={category.kind} />

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Название для сотрудников</label>
            <input name="name" required defaultValue={category.name} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Порядок показа</label>
            <input name="sortOrder" type="number" min={0} defaultValue={category.sortOrder} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Подсказка к категории</label>
            <textarea name="description" rows={2} defaultValue={category.description ?? ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isActive" defaultChecked={category.isActive} className="h-4 w-4" />
            Показывать категорию на сайте
          </label>

          <div>
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Сохранить настройки
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <ConfirmSubmitButton
            action={removeCategory}
            confirmText="Удалить категорию? Если в ней есть позиции, удаление будет запрещено."
            idleLabel="Удалить категорию"
            pendingLabel="Удаляем..."
            variant="danger"
          />
        </div>
      </details>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Позиции в категории</h4>
          <span className="text-xs text-slate-500">Понятные названия и единицы измерения — в приоритете.</span>
        </div>

        {category.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            В этой категории пока нет позиций.
          </div>
        ) : (
          category.items.map((item) => <CategoryItemCard key={item.id} item={item} categoryId={category.id} />)
        )}
      </div>

      <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">Добавить новую позицию</summary>
        <CreateCategoryItemForm categoryId={category.id} />
      </details>
    </article>
  );
}

function CategoryItemCard({ item, categoryId }: { item: PriceItem; categoryId: string }) {
  const updateItem = updatePriceItemAction.bind(null, item.id);
  const removeItem = deletePriceItemAction.bind(null, item.id);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-base font-semibold text-slate-900">{item.title}</h5>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              {item.unit}
            </span>
            {item.isActive ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Активна</span>
            ) : (
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">Скрыта</span>
            )}
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {item.description?.trim() || 'Описание не заполнено. Добавьте пояснение, что входит в эту цену или на что она влияет.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right text-sm text-slate-600">
          <p>Текущая цена</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{formatPrice(Number(item.price))}</p>
          <p className="mt-1 text-xs text-slate-500">Единица: {item.unit}</p>
        </div>
      </div>

      <form action={updateItem} className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <input type="hidden" name="categoryId" value={categoryId} />

        <div className="space-y-1 lg:col-span-2">
          <label className="text-sm font-medium text-slate-700">Название для сотрудников</label>
          <input name="title" required defaultValue={item.title} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Цена, ₽</label>
          <input
            name="price"
            required
            type="number"
            min={0}
            step="0.01"
            defaultValue={item.price.toString()}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-500">Введите только число, без знака рубля.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Единица измерения</label>
          <input name="unit" required defaultValue={item.unit} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="₽/шт" />
          <p className="text-xs text-slate-500">Например: ₽/шт, ₽/м², ₽/лист.</p>
        </div>

        <div className="flex items-end">
          <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 lg:w-auto">
            Сохранить
          </button>
        </div>

        <div className="space-y-1 lg:col-span-2">
          <label className="text-sm font-medium text-slate-700">Пояснение: что входит или на что влияет цена</label>
          <textarea name="description" rows={2} defaultValue={item.description ?? ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Порядок</label>
          <input name="sortOrder" type="number" min={0} defaultValue={item.sortOrder} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>

        <label className="inline-flex items-center gap-2 self-end text-sm text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={item.isActive} className="h-4 w-4" />
          Показывать позицию
        </label>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <ConfirmSubmitButton
          action={removeItem}
          confirmText="Удалить позицию без возможности восстановления?"
          idleLabel="Удалить позицию"
          pendingLabel="Удаляем..."
          variant="danger"
        />
      </div>
    </div>
  );
}

function CreateCategoryItemForm({ categoryId }: { categoryId: string }) {
  return (
    <form action={createPriceItemAction} className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
      <input type="hidden" name="categoryId" value={categoryId} />

      <div className="space-y-1 lg:col-span-2">
        <label className="text-sm font-medium text-slate-700">Название позиции</label>
        <input name="title" required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Например: Ламинация А4" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Цена, ₽</label>
        <input name="price" required type="number" min={0} step="0.01" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        <p className="text-xs text-slate-500">Введите стоимость числом.</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Единица измерения</label>
        <input name="unit" required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="₽/шт" />
      </div>

      <div className="flex items-end">
        <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 lg:w-auto">
          Добавить
        </button>
      </div>

      <div className="space-y-1 lg:col-span-2">
        <label className="text-sm font-medium text-slate-700">Пояснение для сотрудников</label>
        <textarea name="description" rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Коротко опишите, что входит в цену или где она используется." />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Порядок</label>
        <input name="sortOrder" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
      </div>

      <label className="inline-flex items-center gap-2 self-end text-sm text-slate-700">
        <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
        Показывать позицию
      </label>
    </form>
  );
}

function PricingDiagnostics({
  isComplete,
  missingKeys,
  fallbackUsedKeys,
  unknownKeys,
}: {
  isComplete: boolean;
  missingKeys: string[];
  fallbackUsedKeys: Array<{ key: string; reason: string }>;
  unknownKeys: string[];
}) {
  const statusTone = isComplete && fallbackUsedKeys.length === 0
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-amber-300 bg-amber-50 text-amber-900';

  return (
    <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
      <div className={`rounded-xl border px-4 py-3 text-sm ${statusTone}`}>
        <p className="font-semibold">Состояние конфигурации</p>
        <p className="mt-1 leading-6">{getModuleHealthLabel(isComplete, missingKeys, fallbackUsedKeys)}</p>
      </div>

      <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:hidden">Технические детали</summary>
        <div className="mt-3 space-y-3 text-xs leading-6 text-slate-600">
          <p>Используйте этот блок только для диагностики. Обычная работа с ценами не требует просмотра внутренних ключей.</p>
          <ul className="space-y-2">
            <li><span className="font-medium text-slate-900">Отсутствующие ключи:</span> {missingKeys.length ? missingKeys.join(', ') : 'нет'}</li>
            <li>
              <span className="font-medium text-slate-900">Резервные значения:</span>{' '}
              {fallbackUsedKeys.length
                ? fallbackUsedKeys.map((item) => `${item.key} (${item.reason === 'missing' ? 'не найдено' : 'значение некорректно'})`).join(', ')
                : 'не используются'}
            </li>
            <li><span className="font-medium text-slate-900">Неизвестные ключи:</span> {unknownKeys.length ? unknownKeys.join(', ') : 'нет'}</li>
          </ul>
        </div>
      </details>
    </div>
  );
}

function PricingHistory({ histories }: { histories: PricingHistoryItem[] }) {
  return (
    <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">Журнал изменений</summary>
      <p className="mt-3 text-xs leading-6 text-slate-500">Журнал нужен для проверки последних правок. Системные коды показаны только как справка.</p>

      {histories.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Изменений пока нет.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {histories.slice(0, 20).map((history) => (
            <div key={history.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium text-slate-900">Изменение от {history.createdAt.toLocaleString('ru-RU')}</p>
                <p className="text-xs text-slate-500">Системный код: {history.subcategory}.{history.key}</p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Было</p>
                  <p className="mt-1 break-words text-sm text-slate-800">{formatHistoryValue(history.oldValue)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Стало</p>
                  <p className="mt-1 break-words text-sm text-slate-800">{formatHistoryValue(history.newValue)}</p>
                </div>
              </div>
              {history.note ? <p className="mt-3 text-xs text-slate-600">Комментарий: {history.note}</p> : null}
            </div>
          ))}
        </div>
      )}
    </details>
  );
}

function BaguetteExtrasConfigSection({
  histories,
  fallbackUsedKeys,
  missingKeys,
  unknownKeys,
  isComplete,
  groupedSections,
}: {
  histories: PricingHistoryItem[];
  fallbackUsedKeys: Array<{ key: string; reason: string }>;
  missingKeys: string[];
  unknownKeys: string[];
  isComplete: boolean;
  groupedSections: ConfigSection[];
}) {
  return (
    <section id="baguette-extras" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <ModuleHeader
        title="Багет: дополнительные материалы и правила"
        description="Стоимость стекла, ПВХ, картона, печати, крепежа и других доплат для багетного расчёта."
        note="Базовые цены багета и сам каталог рамок по-прежнему редактируются только во внешней таблице."
        sections={groupedSections}
        moduleId="baguette-extras"
      />

      <div className="mt-5">
        <PricingDiagnostics isComplete={isComplete} missingKeys={missingKeys} fallbackUsedKeys={fallbackUsedKeys} unknownKeys={unknownKeys} />
      </div>

      <div className="mt-6 space-y-5">
        {groupedSections.map((section) => (
          <div key={section.id} id={`baguette-extras-${section.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{section.description}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                {section.entries.length} поз.
              </span>
            </div>

            <div className="grid gap-4">
              {section.entries.map((entry) => (
                <BaguetteEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <PricingHistory histories={histories} />
      </div>
    </section>
  );
}

function BaguetteEntryCard({ entry }: { entry: ConfigEntry }) {
  const action = updateBaguetteExtrasPricingEntryAction.bind(null, entry.id);
  const compositeKey = `${entry.subcategory}.${entry.key}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900">{entry.label}</h4>
            {entry.unit ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{entry.unit}</span>
            ) : null}
          </div>
          {entry.description ? <p className="text-sm leading-6 text-slate-600">{entry.description}</p> : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>Текущее значение</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{formatEntryValue(entry.value, entry.unit)}</p>
        </div>
      </div>

      <div className="mt-4">
        {entry.type === 'number' ? (
          <form action={action} className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto]">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Новое значение {entry.unit ? `(${entry.unit})` : ''}</label>
              <input name="value" type="number" min={0} step="0.01" defaultValue={String(entry.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              <p className="text-xs text-slate-500">{getEntryInputHint(entry)}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Комментарий к изменению</label>
              <input name="note" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Например: согласовано с производством" />
            </div>

            <div className="flex items-end">
              <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 lg:w-auto">
                Сохранить
              </button>
            </div>
          </form>
        ) : isBaguetteMaterialRate(entry.value) ? (
          <form action={action} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <input type="hidden" name="editorMode" value="material-rate" />

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Цена материала за м²</label>
              <input name="areaPricePerM2" type="number" min={0} step="0.01" defaultValue={String(entry.value.areaPricePerM2)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              <p className="text-xs text-slate-500">Используется как основная стоимость материала.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Цена резки за погонный метр</label>
              <input name="cuttingPricePerM" type="number" min={0} step="0.01" defaultValue={String(entry.value.cuttingPricePerM)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              <p className="text-xs text-slate-500">Добавляется за резку материала по периметру.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Комментарий к изменению</label>
              <input name="note" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Например: новая цена поставщика" />
            </div>

            <div className="flex items-end">
              <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 lg:w-auto">Сохранить</button>
            </div>
          </form>
        ) : isBaguetteAutoAdditionRule(entry.value) ? (
          <form action={action} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="editorMode" value="auto-addition-rule" />

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Какой ПВХ добавлять автоматически</label>
              <select name="pvcType" defaultValue={entry.value.pvcType} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="none">Не добавлять</option>
                <option value="pvc3">ПВХ 3 мм</option>
                <option value="pvc4">ПВХ 4 мм</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Комментарий к изменению</label>
              <input name="note" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Например: обновили правила для фото" />
            </div>

            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="addOrabond" defaultChecked={entry.value.addOrabond} className="h-4 w-4" />
                Добавлять Orabond
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="forceCardboard" defaultChecked={entry.value.forceCardboard} className="h-4 w-4" />
                Обязательно добавлять картон
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="stretchingRequired" defaultChecked={entry.value.stretchingRequired} className="h-4 w-4" />
                Требуется натяжка на подрамник
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="removeCardboard" defaultChecked={entry.value.removeCardboard} className="h-4 w-4" />
                Не добавлять картон
              </label>
            </div>

            <div className="flex justify-end lg:col-span-2">
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Сохранить правило</button>
            </div>
          </form>
        ) : (
          <form action={action} className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto]">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-sm font-medium text-slate-700">Значение правила</label>
              <textarea name="value" rows={5} defaultValue={JSON.stringify(entry.value, null, 2)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono" />
              <p className="text-xs text-slate-500">{getEntryInputHint(entry)}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Комментарий</label>
              <input name="note" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end justify-end lg:col-span-3">
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Сохранить</button>
            </div>
          </form>
        )}
      </div>

      <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <summary className="cursor-pointer list-none font-medium text-slate-800 marker:hidden">Технические детали</summary>
        <p className="mt-2">Системный код: {compositeKey}</p>
      </details>
    </div>
  );
}

function ConfigModuleSection({
  id,
  title,
  description,
  audienceNote,
  histories,
  fallbackUsedKeys,
  missingKeys,
  unknownKeys,
  isComplete,
  groupedSections,
  updateAction,
}: {
  id: string;
  title: string;
  description: string;
  audienceNote: string;
  histories: PricingHistoryItem[];
  fallbackUsedKeys: Array<{ key: string; reason: string }>;
  missingKeys: string[];
  unknownKeys: string[];
  isComplete: boolean;
  groupedSections: ConfigSection[];
  updateAction: ConfigAction;
}) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <ModuleHeader title={title} description={description} note={audienceNote} sections={groupedSections} moduleId={id} />

      <div className="mt-5">
        <PricingDiagnostics isComplete={isComplete} missingKeys={missingKeys} fallbackUsedKeys={fallbackUsedKeys} unknownKeys={unknownKeys} />
      </div>

      <div className="mt-6 space-y-5">
        {groupedSections.map((section) => (
          <div key={section.id} id={`${id}-${section.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{section.description}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                {section.entries.length} поз.
              </span>
            </div>

            <div className="grid gap-4">
              {section.entries.map((entry) => (
                <ConfigEntryCard key={entry.id} entry={entry} action={updateAction} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <PricingHistory histories={histories} />
      </div>
    </section>
  );
}

function ModuleHeader({
  title,
  description,
  note,
  sections,
  moduleId,
}: {
  title: string;
  description: string;
  note: string;
  sections: ConfigSection[];
  moduleId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">{sections.reduce((sum, section) => sum + section.entries.length, 0)} редактируемых значений</p>
          <p className="mt-1 text-xs leading-5">{note}</p>
        </div>
      </div>

      {sections.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${moduleId}-${section.id}`}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {section.title}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ConfigEntryCard({ entry, action }: { entry: ConfigEntry; action: ConfigAction }) {
  const boundAction = action.bind(null, entry.id);
  const compositeKey = `${entry.subcategory}.${entry.key}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900">{entry.label}</h4>
            {entry.unit ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{entry.unit}</span>
            ) : null}
          </div>
          {entry.description ? <p className="text-sm leading-6 text-slate-600">{entry.description}</p> : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>Текущее значение</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{formatEntryValue(entry.value, entry.unit)}</p>
        </div>
      </div>

      <form action={boundAction} className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr_auto]">
        <input type="hidden" name="entryType" value={entry.type} />

        <div className="space-y-1">
          {entry.type === 'boolean' ? (
            <>
              <span className="text-sm font-medium text-slate-700">Показывать в конструкторе</span>
              <label className="flex min-h-[42px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                <input type="checkbox" name="valueBoolean" value="true" defaultChecked={Boolean(entry.value)} className="h-4 w-4" />
                <span>Материал доступен клиентам в публичном конструкторе</span>
              </label>
            </>
          ) : (
            <>
              <label className="text-sm font-medium text-slate-700">Новое значение {entry.unit ? `(${entry.unit})` : ''}</label>
              <input name="value" type="number" min={0} step="0.01" defaultValue={String(entry.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </>
          )}
          <p className="text-xs text-slate-500">{getEntryInputHint(entry)}</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Комментарий к изменению</label>
          <input name="note" placeholder={entry.type === 'boolean' ? 'Например: временно скрыли материал из конструктора' : 'Например: уточнили прайс от поставщика'} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>

        <div className="flex items-end">
          <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 lg:w-auto">
            Сохранить
          </button>
        </div>
      </form>

      <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <summary className="cursor-pointer list-none font-medium text-slate-800 marker:hidden">Технические детали</summary>
        <p className="mt-2">Системный код: {compositeKey}</p>
      </details>
    </div>
  );
}

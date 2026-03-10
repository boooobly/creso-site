'use client';

import AccessoryHelpTooltip from './AccessoryHelpTooltip';

export type FilterState = {
  color: string;
  style: string;
  widthMin: number;
  widthMax: number;
  priceMin: number;
  priceMax: number;
};

export type GlazingType = 'none' | 'glass' | 'antiReflectiveGlass' | 'plexiglass' | 'pet1mm';
export type HangingType = 'crocodile' | 'wire';
export type WorkType = 'canvas' | 'stretchedCanvas' | 'rhinestone' | 'embroidery' | 'beads' | 'photo' | 'other';
export type StretcherType = 'narrow' | 'wide';
export type FrameMode = 'framed' | 'noFrame';
export type PassepartoutColor =
  | 'white'
  | 'cream'
  | 'ivory'
  | 'lightBeige'
  | 'beige'
  | 'sand'
  | 'lightGray'
  | 'gray'
  | 'graphite'
  | 'black'
  | 'brown'
  | 'darkBlue'
  | 'burgundy'
  | 'olive';

export type MaterialsState = {
  glazing: GlazingType;
  passepartout: boolean;
  passepartoutMm: number;
  passepartoutBottomMm: number;
  passepartoutColor: PassepartoutColor;
  backPanel: boolean;
  hanging: HangingType;
  stand: boolean;
  workType: WorkType;
  stretcherType: StretcherType;
  frameMode: FrameMode;
};

const COLOR_LABELS: Record<string, string> = {
  gold: 'Золото',
  silver: 'Серебро',
  black: 'Чёрный',
  white: 'Белый',
  wood: 'Дерево',
  brown: 'Дерево',
  bronze: 'Бронза',
};

const STYLE_LABELS: Record<string, string> = {
  classic: 'Классика',
  modern: 'Модерн',
  minimal: 'Минимализм',
  baroque: 'Барокко',
  scandi: 'Сканди',
};

type BagetFiltersProps = {
  filters: FilterState;
  setFilters: (next: FilterState) => void;
  materials: MaterialsState;
  setMaterials: (next: MaterialsState) => void;
  colors: string[];
  styles: string[];
  standAllowed: boolean;
  stretcherNarrowAllowed: boolean;
  passepartoutAllowed: boolean;
  glazingAllowed: boolean;
  passepartoutDisabledReason?: string;
  glazingDisabledReason?: string;
};

const selectClassName =
  `w-full appearance-none rounded-xl border border-neutral-300 bg-white bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%236b7280' stroke-width='1.8'%3E%3Cpath d='m6 8 4 4 4-4'/%3E%3C/svg%3E")] bg-[length:1rem_1rem] bg-[right_0.75rem_center] bg-no-repeat p-2 pr-9 text-neutral-900 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100`;

export default function BagetFilters({
  filters,
  setFilters,
  materials,
  setMaterials,
  colors,
  styles,
  standAllowed,
  stretcherNarrowAllowed,
  passepartoutAllowed,
  glazingAllowed,
  passepartoutDisabledReason,
  glazingDisabledReason,
}: BagetFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="card rounded-2xl p-4 shadow-md">
        <h2 className="mb-3 text-base font-semibold">Фильтры</h2>
        <div className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span>Цвет</span>
            <select
              value={filters.color}
              onChange={(e) => setFilters({ ...filters, color: e.target.value })}
              className={selectClassName}
            >
              <option value="all">Все</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {COLOR_LABELS[color] ?? color}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span>Стиль</span>
            <select
              value={filters.style}
              onChange={(e) => setFilters({ ...filters, style: e.target.value })}
              className={selectClassName}
            >
              <option value="all">Все</option>
              {styles.map((style) => (
                <option key={style} value={style}>
                  {STYLE_LABELS[style] ?? style}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-sm">
              <span>Ширина от, мм</span>
              <input
                type="number"
                min={0}
                value={filters.widthMin}
                onChange={(e) => setFilters({ ...filters, widthMin: Number(e.target.value || 0) })}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>до, мм</span>
              <input
                type="number"
                min={0}
                value={filters.widthMax}
                onChange={(e) => setFilters({ ...filters, widthMax: Number(e.target.value || 0) })}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-sm">
              <span>Цена от, ₽</span>
              <input
                type="number"
                min={0}
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value || 0) })}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>до, ₽</span>
              <input
                type="number"
                min={0}
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value || 0) })}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="card rounded-2xl p-4 shadow-md">
        <h2 className="mb-3 text-base font-semibold">Тип работы</h2>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="radio" name="workType" checked={materials.workType === 'canvas'} onChange={() => setMaterials({ ...materials, workType: 'canvas' })} />Картина на основе</label>
          <label className="flex items-center gap-2"><input type="radio" name="workType" checked={materials.workType === 'stretchedCanvas'} onChange={() => setMaterials({ ...materials, workType: 'stretchedCanvas' })} />Холст на подрамнике</label>
          <label className="flex items-center gap-2"><input type="radio" name="workType" checked={materials.workType === 'rhinestone'} onChange={() => setMaterials({ ...materials, workType: 'rhinestone' })} />Стразы</label>
          <label className="flex items-center gap-2"><input type="radio" name="workType" checked={materials.workType === 'embroidery'} onChange={() => setMaterials({ ...materials, workType: 'embroidery' })} />Вышивка</label>
          <label className="flex items-center gap-2"><input type="radio" name="workType" checked={materials.workType === 'beads'} onChange={() => setMaterials({ ...materials, workType: 'beads' })} />Бисер</label>
          <label className="flex items-center gap-2"><input type="radio" name="workType" checked={materials.workType === 'photo'} onChange={() => setMaterials({ ...materials, workType: 'photo' })} />Фото</label>
          <label className="flex items-center gap-2"><input type="radio" name="workType" checked={materials.workType === 'other'} onChange={() => setMaterials({ ...materials, workType: 'other' })} />Другое</label>
        </div>
      </div>

      <div className="card rounded-2xl p-4 shadow-md">
        <h2 className="mb-3 text-base font-semibold">Материалы (за м²)</h2>
        <div className="space-y-3 text-sm">
          {materials.workType === 'stretchedCanvas' ? (
            <div className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Оформление холста</p>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="frameMode"
                  checked={materials.frameMode === 'framed'}
                  onChange={() => setMaterials({ ...materials, frameMode: 'framed' })}
                />
                В багете
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="frameMode"
                  checked={materials.frameMode === 'noFrame'}
                  onChange={() => setMaterials({ ...materials, frameMode: 'noFrame' })}
                />
                Без рамки
              </label>
            </div>
          ) : null}

          {materials.workType === 'stretchedCanvas' ? (
            <div className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Подрамник</p>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stretcherType"
                  checked={materials.stretcherType === 'narrow'}
                  disabled={!stretcherNarrowAllowed}
                  onChange={() => setMaterials({ ...materials, stretcherType: 'narrow' })}
                />
                Узкий (2 см)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stretcherType"
                  checked={materials.stretcherType === 'wide'}
                  onChange={() => setMaterials({ ...materials, stretcherType: 'wide' })}
                />
                Широкий (4 см)
              </label>
              {!stretcherNarrowAllowed ? <p className="text-xs text-amber-700">Узкий подрамник доступен до 50x50 см</p> : null}
            </div>
          ) : null}

          <label className="block space-y-1">
            <span>Остекление</span>
            <select
              value={materials.glazing}
              disabled={!glazingAllowed}
              onChange={(e) => setMaterials({ ...materials, glazing: e.target.value as GlazingType })}
              className={selectClassName}
            >
              <option value="none">Без остекления</option>
              <option value="glass">Стекло</option>
              <option value="antiReflectiveGlass">Антибликовое стекло</option>
              <option value="plexiglass">Оргстекло</option>
              <option value="pet1mm">ПЭТ 1мм</option>
            </select>
          </label>
          {!glazingAllowed && glazingDisabledReason ? <p className="text-xs text-amber-700">{glazingDisabledReason}</p> : null}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={materials.passepartout}
              disabled={!passepartoutAllowed}
              onChange={(e) => setMaterials({ ...materials, passepartout: e.target.checked })}
            />
            Паспарту
          </label>
          {!passepartoutAllowed && passepartoutDisabledReason ? <p className="text-xs text-amber-700">{passepartoutDisabledReason}</p> : null}

          {materials.passepartout ? (
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 p-3 md:grid-cols-2 md:items-end dark:border-neutral-700">
              <label className="space-y-1">
                <span className="block min-h-[2.5rem]">Поля, мм (верх/лево/право)</span>
                <input
                  type="number"
                  min={0}
                  value={materials.passepartoutMm}
                  onChange={(e) => setMaterials({ ...materials, passepartoutMm: Number(e.target.value || 0) })}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
              </label>
              <label className="space-y-1">
                <span className="block min-h-[2.5rem]">Нижнее поле, мм</span>
                <input
                  type="number"
                  min={0}
                  value={materials.passepartoutBottomMm}
                  onChange={(e) => setMaterials({ ...materials, passepartoutBottomMm: Number(e.target.value || 0) })}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />
              </label>
              <label className="block space-y-1 md:col-span-2">
                <span>Цвет паспарту</span>
                <select
                  value={materials.passepartoutColor}
                  onChange={(e) => setMaterials({ ...materials, passepartoutColor: e.target.value as PassepartoutColor })}
                  className={selectClassName}
                >
                  <option value="white">Белый</option>
                  <option value="cream">Кремовый</option>
                  <option value="ivory">Слоновая кость</option>
                  <option value="lightBeige">Светло-бежевый</option>
                  <option value="beige">Бежевый</option>
                  <option value="sand">Песочный</option>
                  <option value="lightGray">Светло-серый</option>
                  <option value="gray">Серый</option>
                  <option value="graphite">Графит</option>
                  <option value="black">Чёрный</option>
                  <option value="brown">Коричневый</option>
                  <option value="darkBlue">Темно-синий</option>
                  <option value="burgundy">Бордовый</option>
                  <option value="olive">Оливковый</option>
                </select>
              </label>
            </div>
          ) : null}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={materials.backPanel}
              onChange={(e) => setMaterials({ ...materials, backPanel: e.target.checked })}
            />
            Картон (задник)
          </label>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Подвес</p>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="hanging"
                checked={materials.hanging === 'crocodile'}
                onChange={() => setMaterials({ ...materials, hanging: 'crocodile' })}
              />
              <span className="inline-flex items-center gap-1.5">
                Крокодильчик
                <AccessoryHelpTooltip
                  imageSrc="/images/accessories/crocodile.png"
                  label="Крокодильчик"
                  ariaLabel="Показать изображение крокодильчика"
                />
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="hanging"
                checked={materials.hanging === 'wire'}
                onChange={() => setMaterials({ ...materials, hanging: 'wire' })}
              />
              <span className="inline-flex items-center gap-1.5">
                Тросик
                <AccessoryHelpTooltip
                  imageSrc="/images/accessories/cable.png"
                  label="Тросик"
                  ariaLabel="Показать изображение тросика"
                />
              </span>
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={materials.stand && standAllowed}
              disabled={!standAllowed}
              onChange={(e) => setMaterials({ ...materials, stand: e.target.checked })}
            />
            <span className="inline-flex items-center gap-1.5">
              Ножка-подставка
              <AccessoryHelpTooltip
                imageSrc="/images/accessories/cardboard_leg.png"
                label="Ножка-подставка"
                ariaLabel="Показать изображение ножки-подставки"
              />
            </span>
          </label>
          {!standAllowed && <p className="text-xs text-amber-700">Ножка доступна только для работ до 30x30 см</p>}
        </div>
      </div>
    </div>
  );
}

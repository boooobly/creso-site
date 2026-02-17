'use client';

export type FilterState = {
  color: string;
  style: string;
  widthMin: number;
  widthMax: number;
  priceMin: number;
  priceMax: number;
};

export type GlazingType = 'none' | 'glass' | 'antiReflectiveGlass' | 'museumGlass' | 'plexiglass' | 'pet1mm';
export type HangingType = 'crocodile' | 'wire';
export type WorkType = 'canvas' | 'stretchedCanvas' | 'rhinestone' | 'embroidery' | 'beads' | 'photo' | 'other';
export type StretcherType = 'narrow' | 'wide';

export type MaterialsState = {
  glazing: GlazingType;
  passepartout: boolean;
  backPanel: boolean;
  hanging: HangingType;
  stand: boolean;
  workType: WorkType;
  stretcherType: StretcherType;
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
};

const selectClassName =
  'w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100';

export default function BagetFilters({
  filters,
  setFilters,
  materials,
  setMaterials,
  colors,
  styles,
  standAllowed,
  stretcherNarrowAllowed,
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
              onChange={(e) => setMaterials({ ...materials, glazing: e.target.value as GlazingType })}
              className={selectClassName}
            >
              <option value="none">Без остекления</option>
              <option value="glass">Стекло</option>
              <option value="antiReflectiveGlass">Антибликовое стекло</option>
              <option value="museumGlass">Музейное стекло</option>
              <option value="plexiglass">Оргстекло</option>
              <option value="pet1mm">ПЭТ 1мм</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={materials.passepartout}
              onChange={(e) => setMaterials({ ...materials, passepartout: e.target.checked })}
            />
            Паспарту
          </label>

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
              Крокодильчик
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="hanging"
                checked={materials.hanging === 'wire'}
                onChange={() => setMaterials({ ...materials, hanging: 'wire' })}
              />
              Тросик
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={materials.stand && standAllowed}
              disabled={!standAllowed}
              onChange={(e) => setMaterials({ ...materials, stand: e.target.checked })}
            />
            Ножка-подставка
          </label>
          {!standAllowed && <p className="text-xs text-amber-700">Ножка доступна только для работ до 30x30 см</p>}
        </div>
      </div>
    </div>
  );
}

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
export type PvcType = 'none' | 'pvc3' | 'pvc4';
export type HangingType = 'crocodile' | 'wire';

export type MaterialsState = {
  glazing: GlazingType;
  passepartout: boolean;
  backPanel: boolean;
  pvc: PvcType;
  hanging: HangingType;
  stand: boolean;
};

type BagetFiltersProps = {
  filters: FilterState;
  setFilters: (next: FilterState) => void;
  materials: MaterialsState;
  setMaterials: (next: MaterialsState) => void;
  colors: string[];
  styles: string[];
  standAllowed: boolean;
};

export default function BagetFilters({
  filters,
  setFilters,
  materials,
  setMaterials,
  colors,
  styles,
  standAllowed,
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
              className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value="all">Все</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span>Стиль</span>
            <select
              value={filters.style}
              onChange={(e) => setFilters({ ...filters, style: e.target.value })}
              className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value="all">Все</option>
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style}
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
        <h2 className="mb-3 text-base font-semibold">Материалы (за м²)</h2>
        <div className="space-y-3 text-sm">
          <label className="block space-y-1">
            <span>Остекление</span>
            <select
              value={materials.glazing}
              onChange={(e) => setMaterials({ ...materials, glazing: e.target.value as GlazingType })}
              className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value="none">Без остекления</option>
              <option value="glass">Стекло</option>
              <option value="antiReflectiveGlass">Антибликовое стекло</option>
              <option value="museumGlass">Музейное стекло</option>
              <option value="plexiglass">Оргстекло</option>
              <option value="pet1mm">PET 1мм</option>
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
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">PVC</p>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="pvc"
                checked={materials.pvc === 'none'}
                onChange={() => setMaterials({ ...materials, pvc: 'none' })}
              />
              <span>Без PVC</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="pvc"
                checked={materials.pvc === 'pvc3'}
                onChange={() => setMaterials({ ...materials, pvc: 'pvc3' })}
              />
              <span>
                PVC 3мм
                <span className="block text-xs text-neutral-500">Для монтажа на клей (например, стразы)</span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="pvc"
                checked={materials.pvc === 'pvc4'}
                onChange={() => setMaterials({ ...materials, pvc: 'pvc4' })}
              />
              <span>
                PVC 4мм
                <span className="block text-xs text-neutral-500">Для натяжки вышивки/бисера</span>
              </span>
            </label>
          </div>

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

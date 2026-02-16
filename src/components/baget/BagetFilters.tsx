'use client';

export type FilterState = {
  color: string;
  style: string;
  widthMin: number;
  widthMax: number;
  priceMin: number;
  priceMax: number;
};

type ServiceState = {
  glass: boolean;
  passepartout: boolean;
  backPanel: boolean;
  urgent: boolean;
};

type BagetFiltersProps = {
  filters: FilterState;
  setFilters: (next: FilterState) => void;
  services: ServiceState;
  setServices: (next: ServiceState) => void;
  colors: string[];
  styles: string[];
};

export default function BagetFilters({ filters, setFilters, services, setServices, colors, styles }: BagetFiltersProps) {
  return (
    <div className="space-y-5">
      <div className="card rounded-2xl p-4 shadow-md">
        <h2 className="mb-3 text-base font-semibold">Фильтры</h2>
        <div className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span>Цвет</span>
            <select
              value={filters.color}
              onChange={(e) => setFilters({ ...filters, color: e.target.value })}
              className="w-full rounded-xl border border-neutral-300 bg-white p-2"
            >
              <option value="all">Все</option>
              {colors.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 text-sm">
            <span>Стиль</span>
            <select
              value={filters.style}
              onChange={(e) => setFilters({ ...filters, style: e.target.value })}
              className="w-full rounded-xl border border-neutral-300 bg-white p-2"
            >
              <option value="all">Все</option>
              {styles.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-sm">
              <span>Ширина от, мм</span>
              <input type="number" min={0} value={filters.widthMin} onChange={(e) => setFilters({ ...filters, widthMin: Number(e.target.value || 0) })} className="w-full rounded-xl border border-neutral-300 p-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span>до, мм</span>
              <input type="number" min={0} value={filters.widthMax} onChange={(e) => setFilters({ ...filters, widthMax: Number(e.target.value || 0) })} className="w-full rounded-xl border border-neutral-300 p-2" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-sm">
              <span>Цена от, ₽</span>
              <input type="number" min={0} value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value || 0) })} className="w-full rounded-xl border border-neutral-300 p-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span>до, ₽</span>
              <input type="number" min={0} value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value || 0) })} className="w-full rounded-xl border border-neutral-300 p-2" />
            </label>
          </div>
        </div>
      </div>

      <div className="card rounded-2xl p-4 shadow-md">
        <h2 className="mb-3 text-base font-semibold">Дополнительные услуги</h2>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={services.glass} onChange={(e) => setServices({ ...services, glass: e.target.checked })} />Стекло (+10%)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={services.passepartout} onChange={(e) => setServices({ ...services, passepartout: e.target.checked })} />Паспарту (+8%)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={services.backPanel} onChange={(e) => setServices({ ...services, backPanel: e.target.checked })} />Задник (+5%)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={services.urgent} onChange={(e) => setServices({ ...services, urgent: e.target.checked })} />Срочный заказ (+15%)</label>
        </div>
      </div>
    </div>
  );
}

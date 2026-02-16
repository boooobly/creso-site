'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import bagetData from '../../../data/baget.json';
import BagetCard, { BagetItem } from './BagetCard';
import BagetFilters, { FilterState } from './BagetFilters';
import BagetPreview from './BagetPreview';

type ServiceState = {
  glass: boolean;
  passepartout: boolean;
  backPanel: boolean;
  urgent: boolean;
};

const ITEMS_PER_PAGE = 12;

const initialFilters: FilterState = {
  color: 'all',
  style: 'all',
  widthMin: 0,
  widthMax: 100,
  priceMin: 0,
  priceMax: 5000,
};

const initialServices: ServiceState = {
  glass: false,
  passepartout: false,
  backPanel: false,
  urgent: false,
};

export default function BagetConfigurator() {
  const items = bagetData as BagetItem[];
  const [widthInput, setWidthInput] = useState('500');
  const [heightInput, setHeightInput] = useState('700');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [services, setServices] = useState<ServiceState>(initialServices);
  const [selectedBaget, setSelectedBaget] = useState<BagetItem | null>(items[0] ?? null);
  const [page, setPage] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const widthMm = Number(widthInput);
  const heightMm = Number(heightInput);
  const validSize = Number.isFinite(widthMm) && Number.isFinite(heightMm) && widthMm >= 50 && heightMm >= 50;

  const colors = useMemo(() => Array.from(new Set(items.map((item) => item.color))), [items]);
  const styles = useMemo(() => Array.from(new Set(items.map((item) => item.style))), [items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const colorMatch = filters.color === 'all' || item.color === filters.color;
        const styleMatch = filters.style === 'all' || item.style === filters.style;
        const widthMatch = item.width_mm >= filters.widthMin && item.width_mm <= filters.widthMax;
        const priceMatch = item.price_per_meter >= filters.priceMin && item.price_per_meter <= filters.priceMax;

        return colorMatch && styleMatch && widthMatch && priceMatch;
      }),
    [filters, items],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const calculation = useMemo(() => {
    if (!validSize || !selectedBaget) {
      return {
        totalMm: 0,
        meters: 0,
        metersWithWaste: 0,
        finalPrice: 0,
      };
    }

    const B = selectedBaget.width_mm;
    const totalMm = ((widthMm + 2 * B) * 2) + ((heightMm + 2 * B) * 2);
    const meters = totalMm / 1000;
    const metersWithWaste = meters * 1.05;
    let price = metersWithWaste * selectedBaget.price_per_meter;

    if (services.glass) price *= 1.1;
    if (services.passepartout) price *= 1.08;
    if (services.backPanel) price *= 1.05;
    if (services.urgent) price *= 1.15;

    return {
      totalMm,
      meters,
      metersWithWaste,
      finalPrice: Math.round(price),
    };
  }, [heightMm, selectedBaget, services, validSize, widthMm]);

  const onImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const next = URL.createObjectURL(file);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="space-y-4">
        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-3 text-base font-semibold">Размер изделия (мм)</h2>
          <div className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span>Ширина (мм)</span>
              <input type="number" min={50} value={widthInput} onChange={(e) => setWidthInput(e.target.value)} className="w-full rounded-xl border border-neutral-300 p-2" />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Высота (мм)</span>
              <input type="number" min={50} value={heightInput} onChange={(e) => setHeightInput(e.target.value)} className="w-full rounded-xl border border-neutral-300 p-2" />
            </label>
            {!validSize && <p className="text-xs text-red-600">Введите корректные значения не менее 50 мм.</p>}
          </div>
        </div>

        <BagetFilters
          filters={filters}
          setFilters={setFilters}
          services={services}
          setServices={setServices}
          colors={colors}
          styles={styles}
        />
      </aside>

      <main className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pagedItems.map((item) => (
            <BagetCard key={item.id} item={item} selected={selectedBaget?.id === item.id} onSelect={setSelectedBaget} />
          ))}
        </div>
        {pagedItems.length === 0 && (
          <div className="card rounded-2xl p-5 text-sm text-neutral-600">По заданным фильтрам ничего не найдено.</div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm">
            <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
              Назад
            </button>
            <span>Страница {page} из {totalPages}</span>
            <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
              Вперёд
            </button>
          </div>
        )}
      </main>

      <aside className="space-y-4">
        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-2 text-base font-semibold">Изображение</h2>
          <input type="file" accept="image/*" onChange={onImageUpload} className="w-full text-sm" />
        </div>

        <BagetPreview widthMm={widthMm} heightMm={heightMm} selectedBaget={selectedBaget} imageUrl={imageUrl} />

        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-3 text-base font-semibold">Расчёт</h2>
          {selectedBaget ? (
            <ul className="space-y-2 text-sm">
              <li><span className="text-neutral-500">Артикул:</span> {selectedBaget.article}</li>
              <li><span className="text-neutral-500">Ширина профиля:</span> {selectedBaget.width_mm} мм</li>
              <li><span className="text-neutral-500">Общая длина:</span> {calculation.meters.toFixed(2)} м</li>
              <li><span className="text-neutral-500">С запасом 5%:</span> {calculation.metersWithWaste.toFixed(2)} м</li>
              <li><span className="text-neutral-500">Итоговая цена:</span> <strong>{calculation.finalPrice.toLocaleString('ru-RU')} ₽</strong></li>
            </ul>
          ) : (
            <p className="text-sm text-neutral-600">Выберите багет для расчёта.</p>
          )}

          <Link href="/contacts" className="btn-primary mt-4 w-full no-underline text-center">Получить расчёт</Link>
        </div>
      </aside>
    </div>
  );
}

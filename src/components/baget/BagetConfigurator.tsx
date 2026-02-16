'use client';

import Link from 'next/link';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import bagetData from '../../../data/baget.json';
import BagetCard, { BagetItem } from './BagetCard';
import BagetFilters, { FilterState, MaterialsState } from './BagetFilters';
import BagetPreview from './BagetPreview';

const ITEMS_PER_PAGE = 12;
const HANGING_PRICES = {
  crocodile: 120,
  wire: 220,
} as const;
const STAND_PRICE = 280;

const MATERIAL_PRICE_PER_M2 = {
  glass: 1600,
  antiReflectiveGlass: 2600,
  museumGlass: 4200,
  plexiglass: 1300,
  pet1mm: 900,
  passepartout: 700,
  cardboard: 450,
  pvc3: 850,
  pvc4: 1100,
} as const;

const initialFilters: FilterState = {
  color: 'all',
  style: 'all',
  widthMin: 0,
  widthMax: 100,
  priceMin: 0,
  priceMax: 5000,
};

const initialMaterials: MaterialsState = {
  glazing: 'none',
  passepartout: false,
  backPanel: true,
  pvc: 'none',
  hanging: 'crocodile',
  stand: false,
};

export default function BagetConfigurator() {
  const items = bagetData as BagetItem[];
  const [widthInput, setWidthInput] = useState('500');
  const [heightInput, setHeightInput] = useState('700');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [materials, setMaterials] = useState<MaterialsState>(initialMaterials);
  const [selectedBaget, setSelectedBaget] = useState<BagetItem | null>(items[0] ?? null);
  const [page, setPage] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewHighlighted, setPreviewHighlighted] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const widthMm = Number(widthInput);
  const heightMm = Number(heightInput);
  const validSize = Number.isFinite(widthMm) && Number.isFinite(heightMm) && widthMm >= 50 && heightMm >= 50;
  const standAllowed = validSize && widthMm <= 300 && heightMm <= 300;

  useEffect(() => {
    if (!standAllowed && materials.stand) {
      setMaterials((prev) => ({ ...prev, stand: false }));
    }
  }, [materials.stand, standAllowed]);

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
        areaM2: 0,
        bagetMeters: 0,
        bagetCost: 0,
        materialsCost: 0,
        pvcCost: 0,
        hangingCost: 0,
        standCost: 0,
        total: 0,
      };
    }

    const B = selectedBaget.width_mm;
    const totalMm = (widthMm + 2 * B) * 2 + (heightMm + 2 * B) * 2;
    const meters = totalMm / 1000;
    const metersWithWaste = meters * 1.05;
    const bagetCost = metersWithWaste * selectedBaget.price_per_meter;

    const areaMm2 = widthMm * heightMm;
    const areaM2 = areaMm2 / 1_000_000;

    let materialsCost = 0;
    if (materials.glazing !== 'none') {
      materialsCost += areaM2 * MATERIAL_PRICE_PER_M2[materials.glazing];
    }
    if (materials.passepartout) {
      materialsCost += areaM2 * MATERIAL_PRICE_PER_M2.passepartout;
    }
    if (materials.backPanel) {
      materialsCost += areaM2 * MATERIAL_PRICE_PER_M2.cardboard;
    }

    let pvcCost = 0;
    if (materials.pvc !== 'none') {
      pvcCost = areaM2 * MATERIAL_PRICE_PER_M2[materials.pvc];
    }

    const hangingCost = HANGING_PRICES[materials.hanging];
    const standCost = materials.stand && standAllowed ? STAND_PRICE : 0;
    const total = Math.round(bagetCost + materialsCost + pvcCost + hangingCost + standCost);

    return {
      areaM2,
      bagetMeters: metersWithWaste,
      bagetCost,
      materialsCost,
      pvcCost,
      hangingCost,
      standCost,
      total,
    };
  }, [heightMm, materials, selectedBaget, standAllowed, validSize, widthMm]);

  const onImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const next = URL.createObjectURL(file);
    setFileName(file.name);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return next;
    });
  }, []);

  const handleSelectBaget = useCallback((item: BagetItem) => {
    setSelectedBaget(item);
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPreviewHighlighted(true);
  }, []);

  useEffect(() => {
    if (!previewHighlighted) return;
    const t = window.setTimeout(() => setPreviewHighlighted(false), 900);
    return () => window.clearTimeout(t);
  }, [previewHighlighted]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20%_45%_35%] lg:items-start">
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-3 text-base font-semibold">Размер изделия (мм)</h2>
          <div className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span>Ширина (мм)</span>
              <input
                type="number"
                min={50}
                value={widthInput}
                onChange={(e) => setWidthInput(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Высота (мм)</span>
              <input
                type="number"
                min={50}
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </label>
            {!validSize && <p className="text-xs text-red-600">Введите корректные значения не менее 50 мм.</p>}
          </div>
        </div>

        <BagetFilters
          filters={filters}
          setFilters={setFilters}
          materials={materials}
          setMaterials={setMaterials}
          colors={colors}
          styles={styles}
          standAllowed={standAllowed}
        />
      </aside>

      <main className="space-y-3 lg:pr-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {pagedItems.map((item) => (
            <BagetCard
              key={item.id}
              item={item}
              selected={selectedBaget?.id === item.id}
              onSelect={handleSelectBaget}
            />
          ))}
        </div>
        {pagedItems.length === 0 && (
          <div className="card rounded-2xl p-4 text-sm text-neutral-600">По заданным фильтрам ничего не найдено.</div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Назад
            </button>
            <span>
              Страница {page} из {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        )}
      </main>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-2 text-base font-semibold">Изображение</h2>
          <input id="baget-image-upload" type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
          <label
            htmlFor="baget-image-upload"
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-all duration-200 hover:bg-neutral-50 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {fileName ? 'Изменить изображение' : 'Загрузить изображение'}
          </label>
          {fileName ? (
            <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs dark:bg-green-900/20">
              <p className="truncate text-neutral-700 dark:text-neutral-200">{fileName}</p>
              <p className="text-green-600 dark:text-green-400">Файл загружен</p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-neutral-500">Поддерживаются изображения JPG, PNG, WEBP.</p>
          )}
        </div>

        <div ref={previewRef}>
          <BagetPreview
            widthMm={widthMm}
            heightMm={heightMm}
            selectedBaget={selectedBaget}
            imageUrl={imageUrl}
            highlighted={previewHighlighted}
          />
        </div>

        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-3 text-base font-semibold">Расчёт</h2>
          {selectedBaget ? (
            <ul className="space-y-2 text-sm transition-all duration-300">
              <li>
                <span className="text-neutral-500">Артикул:</span> {selectedBaget.article}
              </li>
              <li>
                <span className="text-neutral-500">Ширина профиля:</span> {selectedBaget.width_mm} мм
              </li>
              <li>
                <span className="text-neutral-500">Площадь:</span> {calculation.areaM2.toFixed(3)} м²
              </li>
              <li>
                <span className="text-neutral-500">Багет:</span> {calculation.bagetMeters.toFixed(2)} м ×{' '}
                {selectedBaget.price_per_meter.toLocaleString('ru-RU')} ₽ = {Math.round(calculation.bagetCost).toLocaleString('ru-RU')} ₽
              </li>
              <li>
                <span className="text-neutral-500">Материалы:</span> {Math.round(calculation.materialsCost).toLocaleString('ru-RU')} ₽
              </li>
              <li>
                <span className="text-neutral-500">ПВХ:</span> {Math.round(calculation.pvcCost).toLocaleString('ru-RU')} ₽
              </li>
              <li>
                <span className="text-neutral-500">Подвес:</span> {Math.round(calculation.hangingCost).toLocaleString('ru-RU')} ₽
              </li>
              <li>
                <span className="text-neutral-500">Ножка-подставка:</span> {Math.round(calculation.standCost).toLocaleString('ru-RU')} ₽
              </li>
              <li className="border-t border-neutral-200 pt-2 font-semibold">
                Итого: {calculation.total.toLocaleString('ru-RU')} ₽
              </li>
            </ul>
          ) : (
            <p className="text-sm text-neutral-600">Выберите багет для расчёта.</p>
          )}

          <Link
            href="/contacts"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-center text-white no-underline transition-all hover:scale-[1.02] hover:bg-red-700"
          >
            Получить расчёт
          </Link>
        </div>
      </aside>
    </div>
  );
}

'use client';

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import bagetData from '../../../data/baget.json';
import { bagetQuote } from '@/lib/calculations/bagetQuote';
import BagetCard, { BagetItem } from './BagetCard';
import BagetFilters, { FilterState, MaterialsState } from './BagetFilters';
import BagetOrderModal, { BagetOrderSummary } from './BagetOrderModal';
import BagetPreview from './BagetPreview';

const ITEMS_PER_PAGE = 12;

const GLAZING_LABELS: Record<MaterialsState['glazing'], string> = {
  none: 'Без остекления',
  glass: 'Стекло',
  antiReflectiveGlass: 'Антибликовое стекло',
  museumGlass: 'Музейное стекло',
  plexiglass: 'Оргстекло',
  pet1mm: 'ПЭТ 1мм',
};

const WORK_TYPE_LABELS: Record<MaterialsState['workType'], string> = {
  canvas: 'Картина на основе',
  stretchedCanvas: 'Холст на подрамнике',
  rhinestone: 'Стразы',
  embroidery: 'Вышивка',
  beads: 'Бисер',
  photo: 'Фото',
  other: 'Другое',
};

const PASSEPARTOUT_COLOR_LABELS: Record<MaterialsState['passepartoutColor'], string> = {
  white: 'Белый',
  ivory: 'Слоновая кость',
  beige: 'Бежевый',
  gray: 'Серый',
  black: 'Чёрный',
};

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
  passepartoutMm: 40,
  passepartoutBottomMm: 55,
  passepartoutColor: 'white',
  backPanel: true,
  hanging: 'crocodile',
  stand: false,
  workType: 'canvas',
  stretcherType: 'narrow',
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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const widthMm = Number(widthInput);
  const heightMm = Number(heightInput);
  const validSize = Number.isFinite(widthMm) && Number.isFinite(heightMm) && widthMm >= 50 && heightMm >= 50;
  const passepartoutMm = Math.max(0, materials.passepartoutMm);
  const passepartoutBottomMm = Math.max(0, materials.passepartoutBottomMm);
  const quote = useMemo(
    () =>
      bagetQuote({
        width: widthMm,
        height: heightMm,
        quantity: 1,
        selectedBaget,
        workType: materials.workType,
        glazing: materials.glazing,
        hasPassepartout: materials.passepartout,
        passepartoutSize: passepartoutMm,
        passepartoutBottomSize: passepartoutBottomMm,
        backPanel: materials.backPanel,
        hangerType: materials.hanging,
        stand: materials.stand,
        stretcherType: materials.stretcherType,
      }),
    [
      heightMm,
      materials.backPanel,
      materials.glazing,
      materials.hanging,
      materials.passepartout,
      materials.stand,
      materials.stretcherType,
      materials.workType,
      passepartoutBottomMm,
      passepartoutMm,
      selectedBaget,
      widthMm,
    ],
  );

  const standAllowed = quote.meta?.standAllowed ?? false;
  const stretcherNarrowAllowed = quote.meta?.stretcherNarrowAllowed ?? false;
  const effectiveWidthMm = quote.effectiveSize.width;
  const effectiveHeightMm = quote.effectiveSize.height;
  const calcMeta = quote.meta ?? {};
  const autoAdditions = calcMeta.autoAdditions;

  useEffect(() => {
    if (!standAllowed && materials.stand) {
      setMaterials((prev) => ({ ...prev, stand: false }));
    }
  }, [materials.stand, standAllowed]);

  useEffect(() => {
    if (materials.workType === 'stretchedCanvas' && !stretcherNarrowAllowed && materials.stretcherType === 'narrow') {
      setMaterials((prev) => ({ ...prev, stretcherType: 'wide' }));
    }
  }, [materials.stretcherType, materials.workType, stretcherNarrowAllowed]);

  useEffect(() => {
    if (materials.workType !== 'stretchedCanvas') return;

    setMaterials((prev) => ({
      ...prev,
      hanging: 'wire',
      backPanel: false,
    }));
  }, [materials.workType]);

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

  const summaryMaterials = useMemo(() => {
    const materialItems: string[] = [];

    if (materials.glazing !== 'none') {
      materialItems.push(GLAZING_LABELS[materials.glazing]);
    }

    if (materials.backPanel || autoAdditions?.forceCardboard) {
      materialItems.push('Картон (задник)');
    }

    if (autoAdditions?.pvcType === 'pvc3') materialItems.push('ПВХ 3мм');
    if (autoAdditions?.pvcType === 'pvc4') materialItems.push('ПВХ 4мм');
    if (autoAdditions?.addOrabond) materialItems.push('Orabond');
    if (materials.workType === 'stretchedCanvas') {
      materialItems.push(`Подрамник ${materials.stretcherType === 'narrow' ? 'узкий (2 см)' : 'широкий (4 см)'}`);
    }

    return materialItems;
  }, [autoAdditions, materials.backPanel, materials.glazing, materials.stretcherType, materials.workType]);

  const orderSummary = useMemo<BagetOrderSummary>(() => {
    const hangingQuantity = Number(calcMeta.hangingQuantity ?? 1);
    const effectiveHangingType = (calcMeta.hangingType as MaterialsState['hanging'] | undefined) ?? materials.hanging;

    return {
      workSizeMm: {
        wMm: Math.round(widthMm),
        hMm: Math.round(heightMm),
      },
      selectedBaget: selectedBaget
        ? {
            id: selectedBaget.id,
            article: selectedBaget.article,
            title: selectedBaget.name,
            widthMm: selectedBaget.width_mm,
            pricePerM: selectedBaget.price_per_meter,
          }
        : null,
      passepartout: materials.passepartout
        ? {
            enabled: true,
            color: PASSEPARTOUT_COLOR_LABELS[materials.passepartoutColor],
            topMm: passepartoutMm,
            bottomMm: passepartoutBottomMm,
          }
        : {
            enabled: false,
            color: PASSEPARTOUT_COLOR_LABELS[materials.passepartoutColor],
            topMm: 0,
            bottomMm: 0,
          },
      glazing: GLAZING_LABELS[materials.glazing],
      materials: summaryMaterials,
      workType: WORK_TYPE_LABELS[materials.workType],
      hanging: {
        type: effectiveHangingType,
        label: effectiveHangingType === 'crocodile' ? 'Крокодильчик' : 'Тросик',
        quantity: hangingQuantity,
      },
      stand: materials.stand && standAllowed,
    };
  }, [
    effectiveWidthMm,
    materials.glazing,
    materials.hanging,
    materials.passepartout,
    materials.passepartoutColor,
    materials.stand,
    materials.workType,
    passepartoutBottomMm,
    passepartoutMm,
    selectedBaget,
    standAllowed,
    summaryMaterials,
    quote.meta,
    widthMm,
    heightMm,
  ]);

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
          stretcherNarrowAllowed={stretcherNarrowAllowed}
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
            stretchedCanvas={materials.workType === 'stretchedCanvas'}
            passepartoutEnabled={materials.passepartout}
            passepartoutMm={passepartoutMm}
            passepartoutBottomMm={passepartoutBottomMm}
            passepartoutColor={materials.passepartoutColor}
          />
        </div>

        <div className="card rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-neutral-200/70 backdrop-blur-sm dark:bg-neutral-900/80 dark:ring-neutral-700/70">
          <h2 className="mb-3 text-base font-semibold">Расчёт</h2>
          {selectedBaget ? (
            <ul className="space-y-2 text-sm transition-all duration-300">
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Артикул:</span> {selectedBaget.article}
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Ширина профиля:</span> {selectedBaget.width_mm} мм
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Размер работы:</span> {Math.round(widthMm)} × {Math.round(heightMm)} мм
              </li>
              {materials.passepartout ? (
                <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                  <span className="text-neutral-500">Размер с паспарту:</span> {Math.round(effectiveWidthMm)} × {Math.round(effectiveHeightMm)} мм
                </li>
              ) : null}
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Габарит с рамкой:</span> {Math.round(Number(calcMeta.framedWidthMm ?? 0))} × {Math.round(Number(calcMeta.framedHeightMm ?? 0))} мм
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Площадь:</span> {Number(calcMeta.areaM2 ?? 0).toFixed(3)} м²
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Багет:</span> {Number(calcMeta.bagetMeters ?? 0).toFixed(2)} м ×{' '}
                {selectedBaget.price_per_meter.toLocaleString('ru-RU')} ₽ = {Math.round(Number(calcMeta.bagetCost ?? 0)).toLocaleString('ru-RU')} ₽
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Материалы:</span> {Math.round(Number(calcMeta.materialsCost ?? 0)).toLocaleString('ru-RU')} ₽
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">ПВХ:</span> {Math.round(Number(calcMeta.pvcCost ?? 0)).toLocaleString('ru-RU')} ₽
                {autoAdditions?.pvcType !== 'none' ? <span className="ml-2 text-xs text-neutral-500">Добавлено автоматически</span> : null}
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Orabond:</span> {Math.round(Number(calcMeta.orabondCost ?? 0)).toLocaleString('ru-RU')} ₽
                {autoAdditions?.addOrabond ? <span className="ml-2 text-xs text-neutral-500">Добавлено автоматически</span> : null}
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">{String(calcMeta.hangingLabel ?? '')}:</span> {Math.round(Number(calcMeta.hangingCost ?? 0)).toLocaleString('ru-RU')} ₽
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Ножка-подставка:</span> {Math.round(Number(calcMeta.standCost ?? 0)).toLocaleString('ru-RU')} ₽
              </li>
              <li className="border-b border-neutral-200/70 pb-2 dark:border-neutral-700/70">
                <span className="text-neutral-500">Подрамник:</span> {Math.round(Number(calcMeta.stretcherCost ?? 0)).toLocaleString('ru-RU')} ₽
                {materials.workType === 'stretchedCanvas' ? (
                  <span className="ml-2 text-xs text-neutral-500">{materials.stretcherType === 'narrow' ? 'Узкий (2 см)' : 'Широкий (4 см)'}</span>
                ) : null}
              </li>
              {autoAdditions?.forceCardboard ? (
                <li className="text-xs text-neutral-500">Картон (задник): Добавлено автоматически</li>
              ) : null}
              {autoAdditions?.stretchingRequired ? (
                <li className="text-xs text-neutral-500">Требуется натяжка: Добавлено автоматически</li>
              ) : null}
              <li className="mt-1 border-t border-neutral-300 pt-3 text-xl font-bold text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
                Итого: {quote.total.toLocaleString('ru-RU')} ₽
              </li>
            </ul>
          ) : (
            <p className="text-sm text-neutral-600">Выберите багет для расчёта.</p>
          )}

          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            disabled={!selectedBaget || !validSize}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-center text-white no-underline transition-all duration-200 hover:scale-[1.02] hover:bg-red-700 hover:shadow-lg active:scale-[0.98]"
          >
            Оформить заказ
          </button>
        </div>

        <BagetOrderModal
          open={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          orderSummary={orderSummary}
          previewImageUrl={imageUrl ?? undefined}
          totalPriceRub={quote.total}
          effectiveSize={{
            wMm: Math.round(effectiveWidthMm),
            hMm: Math.round(effectiveHeightMm),
          }}
          outerSize={{
            wMm: Math.round(Number(calcMeta.framedWidthMm ?? 0)),
            hMm: Math.round(Number(calcMeta.framedHeightMm ?? 0)),
          }}
        />
      </aside>
    </div>
  );
}

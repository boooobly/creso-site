'use client';

import { ChevronDown } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import AccessoryHelpTooltip from './AccessoryHelpTooltip';
import type { BagetPrintMaterial, BagetPrintRequirement } from '@/lib/baget/printRequirement';

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
  printRequirement: BagetPrintRequirement;
  setPrintRequirement: (next: BagetPrintRequirement) => void;
  colors: string[];
  styles: string[];
  standAllowed: boolean;
  stretcherNarrowAllowed: boolean;
  passepartoutAllowed: boolean;
  glazingAllowed: boolean;
  passepartoutDisabledReason?: string;
  glazingDisabledReason?: string;
  showCatalogFilters?: boolean;
  showWorkType?: boolean;
  showMaterials?: boolean;
};

const selectClassName =
  'w-full appearance-none rounded-xl border border-neutral-300 bg-white p-2 pr-10 text-neutral-900 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100';

type SelectWithChevronProps = ComponentPropsWithoutRef<'select'> & {
  children: ReactNode;
};

function SelectWithChevron({ children, className = '', ...props }: SelectWithChevronProps) {
  return (
    <div className="relative">
      <select className={`${selectClassName} ${className}`.trim()} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
        aria-hidden="true"
      />
    </div>
  );
}

export default function BagetFilters({
  filters,
  setFilters,
  materials,
  setMaterials,
  printRequirement,
  setPrintRequirement,
  colors,
  styles,
  standAllowed,
  stretcherNarrowAllowed,
  passepartoutAllowed,
  glazingAllowed,
  passepartoutDisabledReason,
  glazingDisabledReason,
  showCatalogFilters = true,
  showWorkType = true,
  showMaterials = true,
}: BagetFiltersProps) {
  return (
    <div className="space-y-4">
      {showCatalogFilters ? (
        <div className="card rounded-2xl p-4 shadow-md">
          <h2 className="mb-3 text-base font-semibold">Фильтры</h2>
          <div className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span>Цвет</span>
              <SelectWithChevron
                value={filters.color}
                onChange={(e) => setFilters({ ...filters, color: e.target.value })}
              >
                <option value="all">Все</option>
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {COLOR_LABELS[color] ?? color}
                  </option>
                ))}
              </SelectWithChevron>
            </label>

            <label className="block space-y-1 text-sm">
              <span>Стиль</span>
              <SelectWithChevron
                value={filters.style}
                onChange={(e) => setFilters({ ...filters, style: e.target.value })}
              >
                <option value="all">Все</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {STYLE_LABELS[style] ?? style}
                  </option>
                ))}
              </SelectWithChevron>
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
      ) : null}

      {showWorkType ? (
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
      ) : null}

      {showMaterials ? (
        <div className="card rounded-2xl p-4 shadow-md">
        <h2 className="mb-3 text-base font-semibold">Материалы (за м²)</h2>
        <div className="space-y-3 text-sm">
          {materials.workType === 'stretchedCanvas' ? (
            <div className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-300">Оформление холста</p>
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
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-300">Подрамник</p>
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
              {!stretcherNarrowAllowed ? <p className="text-xs text-amber-700 dark:text-amber-300">Узкий подрамник доступен до 50x50 см</p> : null}
            </div>
          ) : null}

          <label className="block space-y-1">
            <span>Остекление</span>
            <SelectWithChevron
              value={materials.glazing}
              disabled={!glazingAllowed}
              onChange={(e) => setMaterials({ ...materials, glazing: e.target.value as GlazingType })}
            >
              <option value="none">Без остекления</option>
              <option value="glass">Стекло</option>
              <option value="antiReflectiveGlass">Антибликовое стекло</option>
              <option value="plexiglass">Оргстекло</option>
              <option value="pet1mm">ПЭТ 1мм</option>
            </SelectWithChevron>
          </label>
          {!glazingAllowed && glazingDisabledReason ? <p className="text-xs text-amber-700 dark:text-amber-300">{glazingDisabledReason}</p> : null}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={printRequirement.requiresPrint}
              onChange={(e) =>
                setPrintRequirement({
                  ...printRequirement,
                  requiresPrint: e.target.checked,
                  printMaterial: e.target.checked ? (printRequirement.printMaterial ?? 'canvas') : null,
                })
              }
            />
            Требуется печать
          </label>

          {printRequirement.requiresPrint ? (
            <label className="block space-y-1">
              <span>Материал печати</span>
              <SelectWithChevron
                value={printRequirement.printMaterial ?? 'canvas'}
                onChange={(e) =>
                  setPrintRequirement({
                    ...printRequirement,
                    printMaterial: e.target.value as BagetPrintMaterial,
                  })
                }
              >
                <option value="paper">Бумага</option>
                <option value="canvas">Холст</option>
              </SelectWithChevron>
            </label>
          ) : null}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={materials.passepartout}
              disabled={!passepartoutAllowed}
              onChange={(e) => setMaterials({ ...materials, passepartout: e.target.checked })}
            />
            Паспарту
          </label>
          {!passepartoutAllowed && passepartoutDisabledReason ? <p className="text-xs text-amber-700 dark:text-amber-300">{passepartoutDisabledReason}</p> : null}

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
                <SelectWithChevron
                  value={materials.passepartoutColor}
                  onChange={(e) => setMaterials({ ...materials, passepartoutColor: e.target.value as PassepartoutColor })}
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
                </SelectWithChevron>
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
      ) : null}
    </div>
  );
}

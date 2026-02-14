'use client';

import { useMemo, useState } from 'react';

const MATERIAL_OPTIONS = [
  { value: 'selfAdhesive', label: 'Самоклейка' },
  { value: 'oracal', label: 'Оракал' },
] as const;

const COMPLEXITY_OPTIONS = [
  { value: 1, label: 'Простая (1.0)' },
  { value: 1.3, label: 'Средняя (1.3)' },
  { value: 1.6, label: 'Сложная (1.6)' },
] as const;

type MaterialType = typeof MATERIAL_OPTIONS[number]['value'];

export default function PlotterCuttingCalculator() {
  const [material, setMaterial] = useState<MaterialType>('selfAdhesive');
  const [cutLength, setCutLength] = useState('1');
  const [area, setArea] = useState('0');
  const [complexity, setComplexity] = useState<number>(1);
  const [weeding, setWeeding] = useState(false);
  const [mountingFilm, setMountingFilm] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [urgent, setUrgent] = useState(false);

  const cutLengthNum = Number(cutLength);
  const areaNum = Number(area);

  const valuesValid = Number.isFinite(cutLengthNum) && Number.isFinite(areaNum);
  const positiveValues = cutLengthNum >= 0 && areaNum >= 0;

  const baseCost = valuesValid && positiveValues ? cutLengthNum * 30 * complexity : 0;
  const weedingCost = weeding && valuesValid && positiveValues ? cutLengthNum * 15 : 0;
  const mountingFilmCost = mountingFilm && valuesValid && positiveValues ? areaNum * 100 : 0;
  const transferCost = transfer ? 300 : 0;

  const extrasCost = weedingCost + mountingFilmCost + transferCost;
  const subtotal = baseCost + extrasCost;
  const urgentTotal = urgent ? subtotal * 1.3 : subtotal;

  const minimumApplied = urgentTotal > 0 && urgentTotal < 400;
  const totalCost = minimumApplied ? 400 : urgentTotal;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card space-y-4 p-5 md:p-6">
        <h2 className="text-xl font-semibold">Параметры резки</h2>

        <div className="space-y-2">
          <label htmlFor="material" className="text-sm font-medium">Материал</label>
          <div className="relative">
            <select
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value as MaterialType)}
              className="w-full appearance-none rounded-xl border border-neutral-300 bg-white p-3 pr-10 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {MATERIAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="cutLength" className="text-sm font-medium">Длина реза (м)</label>
            <input
              id="cutLength"
              type="number"
              min={0}
              step="0.1"
              value={cutLength}
              onChange={(e) => setCutLength(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="area" className="text-sm font-medium">Площадь (м²)</label>
            <input
              id="area"
              type="number"
              min={0}
              step="0.1"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="complexity" className="text-sm font-medium">Сложность</label>
          <div className="relative">
            <select
              id="complexity"
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-neutral-300 bg-white p-3 pr-10 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {COMPLEXITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </div>

        <div className="space-y-3">
          <CheckLine checked={weeding} onChange={setWeeding} label="Выборка (+15 ₽ / м)" />
          <CheckLine checked={mountingFilm} onChange={setMountingFilm} label="Монтажная пленка (+100 ₽ / м²)" />
          <CheckLine checked={transfer} onChange={setTransfer} label="Перенос на деталь (+300 ₽)" />
          <CheckLine checked={urgent} onChange={setUrgent} label="Срочный заказ (+30%)" />
        </div>

        <div className="space-y-2">
          <label htmlFor="layoutFile" className="text-sm font-medium">Макет файла</label>
          <input
            id="layoutFile"
            type="file"
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:file:bg-neutral-800"
          />
        </div>
      </section>

      <aside className="card h-fit space-y-4 p-5 md:p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold">Расчёт</h2>
        <div className="space-y-2 text-sm">
          <SummaryRow label="Длина реза" value={valuesValid ? `${cutLengthNum.toFixed(2)} м` : '—'} />
          <SummaryRow label="Базовая резка" value={`${baseCost.toLocaleString('ru-RU')} ₽`} />
          <SummaryRow label="Доп. услуги" value={`${extrasCost.toLocaleString('ru-RU')} ₽`} />
          {minimumApplied && <SummaryRow label="Минимальный заказ" value="Применен (400 ₽)" />}
        </div>

        <div className="rounded-2xl border-2 border-red-500/30 bg-white p-6 shadow-xl dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Итого</p>
          <p className="mt-1 text-4xl font-extrabold md:text-5xl">{Math.round(totalCost).toLocaleString('ru-RU')} ₽</p>
          {minimumApplied && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Применена минимальная стоимость заказа — 400 ₽.</p>
          )}
          <Button variant="primary" className="mt-4 w-full">Отправить заявку</Button>
        </div>
      </aside>
    </div>
  );
}

function CheckLine({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center">
      <span>{label}</span>
      <span className="mx-3 flex-1 border-b border-dashed border-neutral-300 dark:border-neutral-700" />
      <b>{value}</b>
    </p>
  );
}

function SelectArrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Button({
  children,
  variant,
  className = '',
}: {
  children: React.ReactNode;
  variant: 'primary';
  className?: string;
}) {
  if (variant === 'primary') {
    return (
      <button type="button" className={`btn-primary ${className}`.trim()}>
        {children}
      </button>
    );
  }

  return null;
}

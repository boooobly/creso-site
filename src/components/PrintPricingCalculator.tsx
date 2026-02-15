'use client';

import { useMemo, useState } from 'react';
import {
  calculatePrintTotalPrice,
  calculatePrintUnitPrice,
  isPrintQuantityValid,
  PRINT_QUICK_QUANTITIES,
  PRINT_SIZE_OPTIONS,
  type PrintDensity,
  type PrintProductType,
  type PrintType,
} from '@/lib/calculations/printPricing';

export default function PrintPricingCalculator() {
  const [productType, setProductType] = useState<PrintProductType>('cards');
  const [size, setSize] = useState<string>(PRINT_SIZE_OPTIONS.cards[0]);
  const [density, setDensity] = useState<PrintDensity>(300);
  const [printType, setPrintType] = useState<PrintType>('single');
  const [lamination, setLamination] = useState(false);
  const [quantity, setQuantity] = useState<number>(100);
  const [customQuantity, setCustomQuantity] = useState('');

  const effectiveQuantity = customQuantity ? Number(customQuantity) : quantity;
  const isQuantityValid = isPrintQuantityValid(effectiveQuantity);

  const totalPrice = useMemo(() => {
    return calculatePrintTotalPrice({
      productType,
      density,
      printType,
      lamination,
      effectiveQuantity,
    });
  }, [density, effectiveQuantity, isQuantityValid, lamination, printType, productType]);

  const unitPrice = useMemo(() => {
    return calculatePrintUnitPrice(totalPrice, effectiveQuantity);
  }, [effectiveQuantity, isQuantityValid, totalPrice]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div className="card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Тип продукции</h2>
          <div className="grid grid-cols-2 gap-3">
            <ToggleButton active={productType === 'cards'} onClick={() => { setProductType('cards'); setSize(PRINT_SIZE_OPTIONS.cards[0]); }}>
              Визитки
            </ToggleButton>
            <ToggleButton active={productType === 'flyers'} onClick={() => { setProductType('flyers'); setSize(PRINT_SIZE_OPTIONS.flyers[0]); }}>
              Флаеры
            </ToggleButton>
          </div>
        </div>

        <div className="card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Размер</h2>
          <div className="grid grid-cols-2 gap-3">
            {PRINT_SIZE_OPTIONS[productType].map((item) => (
              <RadioCard key={item} active={size === item} onClick={() => setSize(item)} label={item} />
            ))}
          </div>
        </div>

        <div className="card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Плотность бумаги</h2>
          <div className="grid grid-cols-3 gap-3">
            {[300, 350, 400].map((value) => (
              <RadioCard
                key={value}
                active={density === value}
                onClick={() => setDensity(value as PrintDensity)}
                label={`${value} gsm`}
              />
            ))}
          </div>
        </div>

        <div className="card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Тип печати</h2>
          <div className="grid grid-cols-2 gap-3">
            <ToggleButton active={printType === 'single'} onClick={() => setPrintType('single')}>
              Односторонняя
            </ToggleButton>
            <ToggleButton active={printType === 'double'} onClick={() => setPrintType('double')}>
              Двусторонняя
            </ToggleButton>
          </div>
        </div>

        <div className="card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Тираж</h2>
          <div className="flex flex-wrap gap-2">
            {PRINT_QUICK_QUANTITIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => { setQuantity(q); setCustomQuantity(''); }}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  !customQuantity && quantity === q
                    ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)]'
                    : 'border-neutral-300 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] dark:border-neutral-700'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-neutral-600 dark:text-neutral-300">Свой тираж</label>
            <input
              type="number"
              min={100}
              value={customQuantity}
              onChange={(e) => setCustomQuantity(e.target.value)}
              placeholder="Введите количество (мин. 100)"
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            {!isQuantityValid && <p className="text-sm text-red-600">Минимальный тираж — 100 шт.</p>}
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={lamination}
              onChange={(e) => setLamination(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="font-medium">Ламинация (+20%)</span>
          </label>
        </div>
      </section>

      <aside className="card h-fit p-5 space-y-4 lg:sticky lg:top-24">
        <h3 className="text-lg font-semibold">Итоговый расчет</h3>
        <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          <li>Продукция: <b>{productType === 'cards' ? 'Визитки' : 'Флаеры'}</b></li>
          <li>Размер: <b>{size}</b></li>
          <li>Плотность: <b>{density} gsm</b></li>
          <li>Печать: <b>{printType === 'single' ? 'Односторонняя' : 'Двусторонняя'}</b></li>
          <li>Ламинация: <b>{lamination ? 'Да' : 'Нет'}</b></li>
          <li>Тираж: <b>{isQuantityValid ? effectiveQuantity : '—'}</b></li>
        </ul>

        <div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Итого</p>
          <p className="text-3xl font-bold">{totalPrice.toLocaleString('ru-RU')} ₽</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{unitPrice.toLocaleString('ru-RU')} ₽ / шт.</p>
        </div>

        <button type="button" className="btn-primary w-full">Оформить заказ</button>
      </aside>
    </div>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition ${
        active
          ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)]'
          : 'border-neutral-300 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] dark:border-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}

function RadioCard({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition ${
        active
          ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)]'
          : 'border-neutral-300 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] dark:border-neutral-700'
      }`}
    >
      {label}
    </button>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { engineUiCatalog, type PrintDensity, type PrintProductType, type PrintType } from '@/lib/engine';
import { openLeadFormWithCalculation } from '@/lib/lead-prefill';
import { trackEvent } from '@/lib/analytics';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type PrintQuote = {
  quantity: number;
  isQuantityValid: boolean;
  totalPrice: number;
  unitPrice: number;
};

export default function PrintPricingCalculator() {
  const [productType, setProductType] = useState<PrintProductType>('cards');
  const [size, setSize] = useState<string>(engineUiCatalog.print.sizeOptions.cards[0]);
  const [density, setDensity] = useState<PrintDensity>(300);
  const [printType, setPrintType] = useState<PrintType>('single');
  const [lamination, setLamination] = useState(false);
  const [quantity, setQuantity] = useState<number>(100);
  const [customQuantity, setCustomQuantity] = useState('');

  const [pricing, setPricing] = useState<PrintQuote>({ quantity: 100, isQuantityValid: true, totalPrice: 0, unitPrice: 0 });
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [pricePulse, setPricePulse] = useState(false);

  const quoteRequest = useMemo(() => ({
    productType,
    size,
    density,
    printType,
    lamination,
    presetQuantity: quantity,
    customQuantityInput: customQuantity,
  }), [customQuantity, density, lamination, printType, productType, quantity, size]);
  const debouncedQuoteRequest = useDebouncedValue(quoteRequest, 300);
  const isQuotePending = quoteRequest !== debouncedQuoteRequest || isQuoteLoading;

  useEffect(() => {
    trackEvent('calculator_started', { calculator: 'print' });
  }, []);

  useEffect(() => {
    trackEvent('calculator_updated', {
      calculator: 'print',
      productType,
      size,
      density,
      printType,
      lamination,
      quantity,
      hasCustomQuantity: Boolean(customQuantity),
    });
  }, [customQuantity, density, lamination, printType, productType, quantity, size]);

  useEffect(() => {
    setPricePulse(true);
    const timer = window.setTimeout(() => setPricePulse(false), 300);
    return () => window.clearTimeout(timer);
  }, [pricing.totalPrice]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchQuote = async () => {
      setIsQuoteLoading(true);
      setQuoteError('');

      try {
        const response = await fetch('/api/quotes/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(debouncedQuoteRequest),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('failed');
        }

        const data = (await response.json()) as { quote: PrintQuote };

        if (active) {
          setPricing(data.quote);
          trackEvent('quote_generated', {
            calculator: 'print',
            totalPrice: data.quote.totalPrice,
            unitPrice: data.quote.unitPrice,
          });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        if (active) {
          setQuoteError('Ошибка расчёта');
          setPricing({ quantity: 0, isQuantityValid: false, totalPrice: 0, unitPrice: 0 });
        }
      } finally {
        if (active) {
          setIsQuoteLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedQuoteRequest]);

  const effectiveQuantityLabel = useMemo(() => (pricing.isQuantityValid ? pricing.quantity : '—'), [pricing.isQuantityValid, pricing.quantity]);

  const handleSendCalculation = () => {
    const calcSummary = [
      `Продукция: ${productType === 'cards' ? 'Визитки' : 'Флаеры'}`,
      `Размер: ${size}`,
      `Плотность: ${density} gsm`,
      `Печать: ${printType === 'single' ? 'Односторонняя' : 'Двусторонняя'}`,
      `Ламинация: ${lamination ? 'Да' : 'Нет'}`,
      `Тираж: ${pricing.isQuantityValid ? pricing.quantity : '—'}`,
      `Итого: ${pricing.totalPrice} ₽`,
    ].join('; ');

    trackEvent('send_calculation_clicked', { calculator: 'print' });

    openLeadFormWithCalculation({
      service: 'Визитки и флаеры',
      message: `Расчёт:
${calcSummary}`,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div className="card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Тип продукции</h2>
          <div className="grid grid-cols-2 gap-3">
            <ToggleButton active={productType === 'cards'} onClick={() => { setProductType('cards'); setSize(engineUiCatalog.print.sizeOptions.cards[0]); }}>
              Визитки
            </ToggleButton>
            <ToggleButton active={productType === 'flyers'} onClick={() => { setProductType('flyers'); setSize(engineUiCatalog.print.sizeOptions.flyers[0]); }}>
              Флаеры
            </ToggleButton>
          </div>
        </div>

        <div className="card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Размер</h2>
          <div className="grid grid-cols-2 gap-3">
            {engineUiCatalog.print.sizeOptions[productType].map((item) => (
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
            {engineUiCatalog.print.quantityPresets.map((q) => (
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
            {!pricing.isQuantityValid && <p className="text-sm text-red-600">Минимальный тираж — 100 шт.</p>}
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
          <li>Тираж: <b>{effectiveQuantityLabel}</b></li>
        </ul>

        <div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Итого</p>
          <p className={`text-3xl font-extrabold transition-transform duration-300 ${pricePulse ? 'scale-105' : 'scale-100'}`}>{pricing.totalPrice.toLocaleString('ru-RU')} ₽</p>
          <p className="min-h-4 text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">{isQuotePending ? 'Обновляем расчёт…' : ' '}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">Финальная цена без скрытых платежей.</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{pricing.unitPrice.toLocaleString('ru-RU')} ₽ / шт.</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Мы подтверждаем итоговую стоимость перед печатью.</p>
          <p className="text-xs text-amber-700 dark:text-amber-300">Цена может измениться в зависимости от наличия бумаги.</p>
        </div>

        <button type="button" className="btn-primary w-full">Оформить заказ</button>
        <button type="button" onClick={handleSendCalculation} className="btn-secondary w-full justify-center">Отправить этот расчёт</button>
        <span className="sr-only" aria-live="polite">{isQuoteLoading ? 'loading' : quoteError}</span>
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

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BUSINESS_CARD_ALLOWED_QUANTITIES,
  calculateTotal,
  getUnitPrice,
} from '@/lib/pricing-config/business-cards';
import OrderBusinessCardsForm from '@/components/OrderBusinessCardsForm';
import RevealOnScroll from '@/components/RevealOnScroll';

type PrintType = 'single' | 'double';

export default function PrintPricingCalculator() {
  const [quantity, setQuantity] = useState<number>(1000);
  const [printType, setPrintType] = useState<PrintType>('single');
  const [lamination, setLamination] = useState(false);
  const [needDesign, setNeedDesign] = useState(false);
  const [summaryHighlight, setSummaryHighlight] = useState(false);

  const pricing = useMemo(() => {
    const total = calculateTotal({ qty: quantity, lamination });

    return {
      total,
      perPiece: total / quantity,
    };
  }, [lamination, quantity]);

  useEffect(() => {
    setSummaryHighlight(true);
    const timeout = setTimeout(() => setSummaryHighlight(false), 520);

    return () => clearTimeout(timeout);
  }, [quantity, printType, lamination, needDesign]);

  const pricingRows = useMemo(
    () => BUSINESS_CARD_ALLOWED_QUANTITIES.map((tierQuantity) => {
      const unitPrice = getUnitPrice(tierQuantity);
      const total = calculateTotal({ qty: tierQuantity, lamination: false });

      return {
        quantity: tierQuantity,
        unitPrice,
        total,
      };
    }),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <RevealOnScroll className="card space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(20,20,20,0.06)] md:p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
            <h2 className="text-lg font-semibold tracking-tight">Тарифы на визитки (офсет)</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">300 gsm, размер 90x50 мм, срок изготовления 7–10 рабочих дней.</p>
            <div className="overflow-x-auto rounded-xl border border-neutral-200/90 bg-white dark:border-neutral-700/80 dark:bg-neutral-900/30">
              <table className="w-full min-w-[420px] table-fixed text-sm">
                <thead className="bg-neutral-100/70 dark:bg-neutral-800/80">
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="px-4 py-2.5 text-left font-semibold">Тираж</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Цена за шт.</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row) => {
                    const isSelected = quantity === row.quantity;

                    return (
                      <tr
                        key={row.quantity}
                        className={`border-b border-neutral-100 transition-all duration-200 dark:border-neutral-800 last:border-b-0 ${
                          isSelected
                            ? 'bg-red-50/80 dark:bg-red-950/20'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/70'
                        }`}
                      >
                        <td className="px-4 py-2.5 font-semibold text-neutral-800 dark:text-neutral-100">{row.quantity.toLocaleString('ru-RU')} шт.</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-neutral-700 dark:text-neutral-200">{row.unitPrice.toLocaleString('ru-RU')} ₽</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium text-neutral-900 dark:text-neutral-100">{row.total.toLocaleString('ru-RU')} ₽</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Цены указаны без ламинации.</p>
          </RevealOnScroll>

          <RevealOnScroll className="card rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(20,20,20,0.06)] md:p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
            <h2 className="text-xl font-semibold tracking-tight">Конфигуратор</h2>

            <div className="mt-4 space-y-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/40">
              <p className="font-medium text-neutral-800 dark:text-neutral-100">Тираж</p>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_CARD_ALLOWED_QUANTITIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuantity(value)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 ${
                      quantity === value
                        ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/40">
              <p className="font-medium text-neutral-800 dark:text-neutral-100">Печать</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ToggleButton active={printType === 'single'} onClick={() => setPrintType('single')}>
                  Односторонняя
                </ToggleButton>
                <ToggleButton active={printType === 'double'} onClick={() => setPrintType('double')}>
                  Двусторонняя
                </ToggleButton>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Цена для односторонней и двусторонней печати одинаковая.</p>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/40">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={lamination}
                  onChange={(e) => setLamination(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-400 text-red-600 focus:ring-red-500/40"
                />
                <span className="font-medium">Ламинация (+15%)</span>
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Ламинация возможна только с одной стороны.</p>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/40">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={needDesign}
                  onChange={(e) => setNeedDesign(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-400 text-red-600 focus:ring-red-500/40"
                />
                <span className="font-medium">Нужен дизайн</span>
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Стоимость дизайна согласовывается с менеджером.</p>
            </div>
          </RevealOnScroll>
        </section>

        <RevealOnScroll className="lg:sticky lg:top-24">
          <aside
            className={`card h-fit space-y-4 rounded-2xl border bg-white p-5 shadow-[0_10px_30px_rgba(15,15,15,0.1)] transition-all duration-300 dark:bg-neutral-950/50 ${
              summaryHighlight
                ? 'border-red-300/70 dark:border-red-800/80'
                : 'border-neutral-200/90 dark:border-neutral-800'
            }`}
          >
            <h3 className="text-lg font-semibold tracking-tight">Итог</h3>
            <ul className="space-y-2 text-sm">
              <SummaryItem label="Продукт" value="Визитки" />
              <SummaryItem label="Размер" value="90x50" />
              <SummaryItem label="Материал" value="300 gsm" />
              <SummaryItem label="Печать" value={printType === 'single' ? 'Односторонняя' : 'Двусторонняя'} />
              <SummaryItem label="Ламинация" value={lamination ? 'Да' : 'Нет'} />
              <SummaryItem label="Тираж" value={quantity.toLocaleString('ru-RU')} />
              <SummaryItem label="Срок" value="7–10 рабочих дней" />
            </ul>

            <div
              className={`rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-4 transition-all duration-300 dark:border-neutral-700 dark:bg-neutral-900/90 ${
                summaryHighlight ? 'ring-2 ring-red-500/20' : ''
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-300">Окончательная стоимость</p>
              <p className="text-[2.15rem] font-extrabold leading-tight tracking-tight tabular-nums">{pricing.total.toLocaleString('ru-RU')} ₽</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 tabular-nums">{pricing.perPiece.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽ / шт.</p>
            </div>

            <div className="space-y-1 rounded-xl border border-neutral-200 p-3 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              <p>• Цены без скрытых платежей.</p>
              <p>• Цена для двусторонней печати не меняется.</p>
              <p>• Стоимость дизайна согласовывается с менеджером.</p>
            </div>
          </aside>
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <section className="card space-y-2 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(20,20,20,0.05)] md:p-5 dark:border-neutral-800 dark:bg-neutral-950/40">
          <h2 className="text-lg font-semibold tracking-tight">Флаеры</h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">Флаеры рассчитываются индивидуально. Цена зависит от размера, бумаги и тиража.</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Отметьте чекбокс Флаеры в заявке ниже, и менеджер подготовит расчёт.</p>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <OrderBusinessCardsForm
          summary={{
            quantity,
            printSide: printType,
            lamination,
            needDesign,
            unitPrice: Math.round((pricing.total / quantity) * 100) / 100,
            totalPrice: pricing.total,
          }}
        />
      </RevealOnScroll>
    </div>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 ${
        active
          ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'
          : 'border-neutral-300 bg-white text-neutral-700 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-200'
      }`}
    >
      {children}
    </button>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <b className="text-right text-neutral-800 dark:text-neutral-100">{value}</b>
    </li>
  );
}

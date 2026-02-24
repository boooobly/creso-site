'use client';

import { useMemo, useState } from 'react';
import {
  BUSINESS_CARD_ALLOWED_QUANTITIES,
  calculateTotal,
  getUnitPrice,
} from '@/lib/pricing-config/business-cards';
import OrderBusinessCardsForm from '@/components/OrderBusinessCardsForm';

type PrintType = 'single' | 'double';

export default function PrintPricingCalculator() {
  const [quantity, setQuantity] = useState<number>(1000);
  const [printType, setPrintType] = useState<PrintType>('single');
  const [lamination, setLamination] = useState(false);
  const [needDesign, setNeedDesign] = useState(false);

  const pricing = useMemo(() => {
    const total = calculateTotal({ qty: quantity, lamination });

    return {
      total,
      perPiece: total / quantity,
    };
  }, [lamination, quantity]);

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
          <div className="card p-4 md:p-6 space-y-4">
            <h2 className="text-lg font-semibold">Тарифы на визитки (офсет)</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">300 gsm, размер 90x50 мм, срок изготовления 7–10 рабочих дней.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="px-3 py-2 text-left font-semibold">Тираж</th>
                    <th className="px-3 py-2 text-left font-semibold">Цена за шт.</th>
                    <th className="px-3 py-2 text-left font-semibold">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row) => (
                    <tr key={row.quantity} className="border-b border-neutral-100 dark:border-neutral-800 last:border-b-0">
                      <td className="px-3 py-2">{row.quantity.toLocaleString('ru-RU')} шт.</td>
                      <td className="px-3 py-2">{row.unitPrice.toLocaleString('ru-RU')} ₽</td>
                      <td className="px-3 py-2">{row.total.toLocaleString('ru-RU')} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-4 md:p-6 space-y-5">
            <h2 className="text-lg font-semibold">Конфигуратор</h2>

            <div className="space-y-3">
              <p className="font-medium">Тираж</p>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_CARD_ALLOWED_QUANTITIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuantity(value)}
                    className={`rounded-xl border px-4 py-2 text-sm transition ${
                      quantity === value
                        ? 'border-[var(--brand-red)] bg-[var(--brand-red)]/10 text-[var(--brand-red)]'
                        : 'border-neutral-300 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] dark:border-neutral-700'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-medium">Печать</p>
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

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lamination}
                  onChange={(e) => setLamination(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="font-medium">Ламинация (+15%)</span>
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Ламинация возможна только с одной стороны.</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needDesign}
                  onChange={(e) => setNeedDesign(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="font-medium">Нужен дизайн</span>
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Стоимость дизайна согласовывается с менеджером.</p>
            </div>
          </div>
        </section>

        <aside className="card h-fit p-5 space-y-4 lg:sticky lg:top-24">
          <h3 className="text-lg font-semibold">Итог</h3>
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>Продукт: <b>Визитки</b></li>
            <li>Размер: <b>90x50</b></li>
            <li>Материал: <b>300 gsm</b></li>
            <li>Печать: <b>{printType === 'single' ? 'Односторонняя' : 'Двусторонняя'}</b></li>
            <li>Ламинация: <b>{lamination ? 'Да' : 'Нет'}</b></li>
            <li>Тираж: <b>{quantity.toLocaleString('ru-RU')}</b></li>
            <li>Срок: <b>7–10 рабочих дней</b></li>
          </ul>

          <div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Итого</p>
            <p className="text-3xl font-extrabold">{pricing.total.toLocaleString('ru-RU')} ₽</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{pricing.perPiece.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽ / шт.</p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300 space-y-1">
            <p>• Цены без скрытых платежей.</p>
            <p>• Цена для двусторонней печати не меняется.</p>
            <p>• Стоимость дизайна согласовывается с менеджером.</p>
          </div>

        </aside>
      </div>

      <section className="card p-4 md:p-6 space-y-3">
        <h2 className="text-xl font-semibold">Флаеры</h2>
        <p className="text-neutral-700 dark:text-neutral-300">Флаеры рассчитываются индивидуально. Цена зависит от размера, бумаги и тиража.</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Отметьте чекбокс Флаеры в заявке ниже, и менеджер подготовит расчёт.</p>
      </section>

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

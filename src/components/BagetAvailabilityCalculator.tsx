'use client';

import { useMemo, useState } from 'react';
import {
  BAGUETTES,
  calculateRequiredBagetLength,
  isBaguetteSuitable,
  validateBagetDimensions,
} from '@/lib/calculations/bagetAvailability';

export default function BagetAvailabilityCalculator() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const { inputsFilled, isValid, widthNum, heightNum } = useMemo(
    () => validateBagetDimensions(width, height),
    [height, width],
  );

  const requiredLength = useMemo(() => calculateRequiredBagetLength(isValid, widthNum, heightNum), [isValid, widthNum, heightNum]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-neutral-700">Ширина работы (см)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="Например, 40"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-neutral-700">Высота работы (см)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="Например, 60"
          />
        </label>
      </div>

      {!inputsFilled && (
        <p className="text-sm text-neutral-600">Введите ширину и высоту, чтобы рассчитать необходимую длину багета.</p>
      )}

      {inputsFilled && !isValid && (
        <p className="text-sm text-red-600">Введите корректные положительные числа.</p>
      )}

      {requiredLength !== null && (
        <p className="rounded-xl bg-neutral-50 p-3 text-sm font-medium">
          Требуемый периметр: <span className="font-bold">{requiredLength.toFixed(1)} см</span>
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <tr>
              <th className="p-3 font-semibold">Изображение</th>
              <th className="p-3 font-semibold">Название</th>
              <th className="p-3 font-semibold">Доступная длина</th>
              <th className="p-3 font-semibold">Ширина профиля</th>
              <th className="p-3 font-semibold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {BAGUETTES.map((item) => {
              const suitable = isBaguetteSuitable(item.availableLength, requiredLength);
              const checked = requiredLength !== null;

              return (
                <tr
                  key={item.id}
                  className={
                    checked
                      ? suitable
                        ? 'bg-green-50 hover:bg-neutral-50 dark:bg-green-900/20 dark:hover:bg-neutral-800/60'
                        : 'opacity-60 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                  }
                >
                  <td className="p-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-md border border-neutral-300 object-contain bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.availableLength} см</td>
                  <td className="p-3">{item.profileWidth ? `${item.profileWidth} см` : '—'}</td>
                  <td className="p-3">
                    {!checked ? (
                      <span className="text-neutral-500">Введите размеры</span>
                    ) : suitable ? (
                      <span className="font-medium text-green-700">✓ Подходит</span>
                    ) : (
                      <span className="font-medium text-red-700">✗ Недостаточно длины</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

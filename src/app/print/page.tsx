import PrintPricingCalculator from '@/components/PrintPricingCalculator';

const featureChips = [
  'Офсетная печать',
  '300 gsm мелованный картон',
  'Кратно 1000',
  '7–10 рабочих дней',
] as const;

export default function PrintPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Офсетные визитки</h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        Фиксированные параметры печати: 90x50 мм, мелованный картон 300 gsm. Выберите тираж и опции, затем отправьте заявку менеджеру.
      </p>

      <div className="flex flex-wrap gap-2">
        {featureChips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
            {chip}
          </span>
        ))}
      </div>

      <PrintPricingCalculator />
    </div>
  );
}

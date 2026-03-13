import PrintPricingCalculator from '@/components/PrintPricingCalculator';
import RevealOnScroll from '@/components/RevealOnScroll';

const featureChips = [
  'Офсетная печать',
  '300 gsm мелованный картон',
  'Кратно 1000',
  '7–10 рабочих дней',
] as const;

export default function PrintPage() {
  return (
    <div className="space-y-6">
      <RevealOnScroll className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_6px_20px_rgba(10,10,10,0.04)] md:p-6 dark:border-neutral-800 dark:bg-neutral-950/50">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">Печать визиток</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-[1.95rem] dark:text-neutral-100">Офсетные визитки</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-neutral-700 md:text-[0.95rem] dark:text-neutral-300">
          Фиксированные параметры печати: 90x50 мм, мелованный картон 300 gsm. Выберите тираж и опции, затем отправьте заявку менеджеру.
        </p>

        <div className="flex flex-wrap gap-2 pt-1.5">
          {featureChips.map((chip, index) => (
            <span
              key={chip}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-all duration-300 hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
              {chip}
            </span>
          ))}
        </div>
      </RevealOnScroll>

      <PrintPricingCalculator />
    </div>
  );
}

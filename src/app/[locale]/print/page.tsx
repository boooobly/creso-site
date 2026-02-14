import PrintPricingCalculator from '@/components/PrintPricingCalculator';

export default function PrintPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Калькулятор: Визитки и флаеры</h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        Выберите параметры печати и мгновенно получите стоимость тиража.
      </p>
      <PrintPricingCalculator />
    </div>
  );
}

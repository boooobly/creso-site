import PrintPricingCalculator from '@/components/PrintPricingCalculator';

export default function PrintPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Офсетные визитки</h1>
      <p className="text-neutral-700 dark:text-neutral-300">
        Фиксированные параметры печати: 90x50 мм, мелованный картон 300 gsm. Выберите тираж и опции, затем отправьте заявку менеджеру.
      </p>
      <PrintPricingCalculator />
    </div>
  );
}

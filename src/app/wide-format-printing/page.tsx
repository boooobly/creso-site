import Link from 'next/link';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';
import OrderWideFormatForm from '@/components/OrderWideFormatForm';

export default function WideFormatPrintingPage() {
  const trustMarkers = [
    '720 dpi, 6 проходов',
    'Ширина рулона до 3.2 м',
    'Срок изготовления от 1 рабочего дня',
    'Работаем с НДС',
  ];

  return (
    <div>
      <Section className="pb-8">
        <div className="card p-8 md:p-10">
          <h1 className="text-3xl font-bold md:text-4xl">Широкоформатная печать до 3.2 м</h1>
          <p className="mt-3 text-neutral-600">Материалы, интерьерная/уличная печать, варианты постобработки.</p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
            {trustMarkers.map((marker) => (
              <p key={marker} className="inline-flex items-center gap-2">
                <span className="text-emerald-600" aria-hidden="true">✔</span>
                <span>{marker}</span>
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <WideFormatPricingCalculator />
      </Section>

      <Section className="pt-0">
        <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Нужна фигурная резка?</h2>
            <p className="text-neutral-700">Перейдите к услуге плоттерной резки.</p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <Link href="/plotter-cutting" className="btn-primary w-full text-center no-underline md:w-auto">Перейти к плоттерной резке</Link>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-16">
        <div className="mb-5 rounded-xl border border-neutral-200/80 bg-neutral-50 p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
          <h3 className="text-lg font-semibold">📌 Почему выбирают нас</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>• Собственное производство</li>
            <li>• Проверка макета перед печатью</li>
            <li>• Контроль цвета</li>
            <li>• Работаем по договору</li>
          </ul>
        </div>
        <OrderWideFormatForm />
      </Section>
    </div>
  );
}

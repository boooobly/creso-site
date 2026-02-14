import Link from 'next/link';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';

export default function WideFormatPrintingPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold">Широкоформатная печать до 3.2 м</h1>
          <p className="mt-3 text-neutral-700 dark:text-neutral-300">
            Материалы, интерьерная/уличная печать, варианты постобработки.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <WideFormatPricingCalculator />
      </Section>

      <Section className="pt-0">
        <div className="card p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Нужна фигурная резка?</h2>
            <p className="text-neutral-700 dark:text-neutral-300">Перейдите к услуге плоттерной резки.</p>
          </div>
          <Link href="/plotter-cutting" className="btn-primary no-underline w-full md:w-auto text-center">
            Перейти к плоттерной резке
          </Link>
        </div>
      </Section>
    </div>
  );
}

import Link from 'next/link';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';
import OrderWideFormatForm from '@/components/OrderWideFormatForm';

export default function WideFormatPrintingPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Широкоформатная печать до 3.2 м</h1>
          <p className="mt-3 text-neutral-700">Материалы, интерьерная/уличная печать, варианты постобработки.</p>
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
        <OrderWideFormatForm />
      </Section>
    </div>
  );
}

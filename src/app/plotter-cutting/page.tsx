import Link from 'next/link';
import Section from '@/components/Section';
import PlotterCuttingCalculator from '@/components/PlotterCuttingCalculator';

export default function PlotterCuttingPage() {
  return (
    <div>
      <Section className="pb-8">
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">Плоттерная резка самоклеящейся пленки и оракала</h1>
          <p className="mt-3 text-neutral-700 dark:text-neutral-300">Резка по контуру, выборка, монтаж.</p>
        </div>
      </Section>

      <Section className="pt-0">
        <PlotterCuttingCalculator />
      </Section>

      <Section className="pt-0">
        <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold">Нужна печать перед резкой?</h2>
            <p className="text-neutral-700 dark:text-neutral-300">Сначала напечатаем макет, затем аккуратно вырежем по контуру.</p>
          </div>
          <Link href="/wide-format-printing" className="btn-primary w-full text-center no-underline md:w-auto">
            Перейти к широкоформатной печати
          </Link>
        </div>
      </Section>
    </div>
  );
}

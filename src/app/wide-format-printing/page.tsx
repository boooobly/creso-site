import Link from 'next/link';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';
import OrderWideFormatForm from '@/components/OrderWideFormatForm';

type WideFormatPageProps = {
  searchParams?: {
    width?: string;
    height?: string;
  };
};

function buildBagetHref(width?: string, height?: string) {
  const params = new URLSearchParams();
  if (width?.trim()) params.set('width', width.trim());
  if (height?.trim()) params.set('height', height.trim());
  const query = params.toString();
  return query ? `/baget?${query}` : '/baget';
}

export default function WideFormatPrintingPage({ searchParams }: WideFormatPageProps) {
  const bagetHref = buildBagetHref(searchParams?.width, searchParams?.height);

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
            <Link href={bagetHref} className="w-full rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-semibold text-white no-underline transition-all hover:scale-[1.02] md:w-auto">
              Оформить в багет
            </Link>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="card space-y-5 p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold">Печать на холсте</h2>
          <p className="text-neutral-700">
            Выполняем интерьерную печать на натуральном холсте с последующей галерейной натяжкой на подрамник.
            Подскажем оптимальный материал и подготовим изделие к размещению в интерьере.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-neutral-700">
            <li>Интерьерная печать</li>
            <li>Натуральный холст</li>
            <li>Галерейная натяжка</li>
            <li>Подрамник</li>
          </ul>
          <div className="flex flex-col gap-3 md:flex-row">
            <a href="#wide-format-order-form" className="btn-primary w-full text-center no-underline md:w-auto">Рассчитать стоимость</a>
            <Link href={bagetHref} className="w-full rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-semibold text-white no-underline transition-all hover:scale-[1.02] md:w-auto">
              Оформить в багет
            </Link>
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-16">
        <OrderWideFormatForm />
      </Section>
    </div>
  );
}

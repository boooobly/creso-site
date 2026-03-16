import Link from 'next/link';
import { Building2, ClipboardCheck, Droplets, FileText } from 'lucide-react';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';
import OrderWideFormatForm from '@/components/OrderWideFormatForm';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';

export default async function WideFormatPrintingPage() {
  const contentMap = await getPageContentMap('wide_format');

  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Широкоформатная печать до 3.2 м');
  const heroDescription = getPageContentValue(
    contentMap,
    'hero',
    'description',
    'Материалы, интерьерная/уличная печать, варианты постобработки.'
  );
  const ctaTitle = getPageContentValue(contentMap, 'cta', 'title', 'Нужна фигурная резка?');
  const ctaDescription = getPageContentValue(contentMap, 'cta', 'description', 'Перейдите к услуге плоттерной резки.');
  const ctaButtonText = getPageContentValue(contentMap, 'cta', 'buttonText', 'Перейти к плоттерной резке');

  const trustMarkers = [
    '720 dpi, 6 проходов',
    'Ширина рулона до 3.2 м',
    'Срок изготовления от 1 рабочего дня',
    'Рекламным агентствам -10% (по запросу)',
    'Юрлицам - оплата по счету',
  ];
  const features = [
    {
      title: 'Собственное производство',
      description: 'Полный цикл печати без посредников.',
      icon: Building2,
    },
    {
      title: 'Проверка макета',
      description: 'Проверяем файл перед запуском в печать.',
      icon: ClipboardCheck,
    },
    {
      title: 'Контроль цвета',
      description: 'Калиброванное оборудование и точность передачи.',
      icon: Droplets,
    },
    {
      title: 'Работа по договору',
      description: 'Заключаем официальный договор при необходимости.',
      icon: FileText,
    },
  ];

  return (
    <div>
      <Section className="pt-6 pb-4 md:pt-10 md:pb-6">
        <div className="card p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">{heroTitle}</h1>
          <p className="mt-3 text-neutral-600">{heroDescription}</p>

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

      <Section className="pt-4 pb-12 md:pt-6">
        <div className="space-y-10">
          <WideFormatPricingCalculator />

          <div className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h2 className="text-2xl font-semibold">{ctaTitle}</h2>
              <p className="text-neutral-700">{ctaDescription}</p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <Link href="/plotter-cutting" className="btn-primary w-full text-center no-underline md:w-auto">{ctaButtonText}</Link>
            </div>
          </div>

          <section className="mt-10 rounded-2xl border border-neutral-200/70 bg-muted/30 p-6 md:p-8">
            <h3 className="text-xl font-semibold md:text-2xl">Почему выбирают нас</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="h-full rounded-2xl border border-neutral-200 bg-white/90 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_12px_30px_rgba(220,38,38,0.10)]"
                  >
                    <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--brand-red)]/20 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                      <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <OrderWideFormatForm />
        </div>
      </Section>
    </div>
  );
}

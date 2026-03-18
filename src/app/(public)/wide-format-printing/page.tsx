import Link from 'next/link';
import { ArrowRight, Building2, ClipboardCheck, Clock3, Droplets, FileText, Ruler } from 'lucide-react';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';
import OrderWideFormatForm from '@/components/OrderWideFormatForm';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getWideFormatPricingConfig } from '@/lib/wide-format/wideFormatPricing';

export default async function WideFormatPrintingPage() {
  const [contentMap, pricing] = await Promise.all([
    getPageContentMap('wide_format'),
    getWideFormatPricingConfig(),
  ]);

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
    'Баннер, пленка, бумага и холст',
    'Интерьерная и уличная печать',
    'Постобработка и подготовка к монтажу',
    'Тиражи для офисов, сетей и рекламных агентств',
  ];
  const heroHighlights = [
    {
      title: 'Печать до 3.2 м',
      description: 'Широкие рулоны для баннеров, витрин и фасадных поверхностей.',
      icon: Ruler,
    },
    {
      title: 'Запуск от 1 дня',
      description: 'Подстраиваем сроки под монтаж, запуск акции или открытие точки.',
      icon: Clock3,
    },
    {
      title: 'Проверка макета',
      description: 'Смотрим файл перед печатью и подсказываем по материалу и постобработке.',
      icon: ClipboardCheck,
    },
    {
      title: 'Удобно для бизнеса',
      description: 'Счет, договор и сопровождение заказов для юрлиц и агентств.',
      icon: Building2,
    },
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
        <div className="card overflow-hidden border-neutral-200/80 bg-gradient-to-br from-white via-neutral-50 to-red-50/35 p-6 shadow-sm shadow-neutral-200/60 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,360px)] lg:items-start">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="t-eyebrow inline-flex rounded-full border border-[var(--brand-red)]/15 bg-[var(--brand-red)]/[0.07] px-4 py-1.5">
                  Широкоформатная печать
                </p>
                <h1 className="max-w-4xl text-[clamp(2.5rem,5.8vw,4.3rem)] font-bold leading-[1.02] tracking-[-0.03em] text-neutral-900">
                  {heroTitle}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
                  {heroDescription} Печатаем интерьерные и уличные материалы, помогаем быстро согласовать параметры и подготовить заказ к запуску.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="#wide-format-calculator" className="btn-primary gap-2 no-underline">
                  Рассчитать стоимость
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href="#wide-format-form" className="btn-secondary no-underline">
                  Отправить параметры заказа
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {trustMarkers.map((marker) => (
                  <span
                    key={marker}
                    className="chip-elevated inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-neutral-700 md:text-sm"
                  >
                    <span className="card-dot" aria-hidden="true" />
                    {marker}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200/80 bg-white/90 p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.32)] backdrop-blur-sm md:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-red)]">Производственный профиль</p>
                  <p className="mt-1 text-sm text-neutral-600">Ключевые параметры услуги для быстрого выбора.</p>
                </div>
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-red-50 text-[var(--brand-red)]">
                  <Droplets size={20} strokeWidth={1.9} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {heroHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4 transition-colors duration-200 hover:border-neutral-300 hover:bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-red)]/15 bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                          <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-neutral-600">{item.description}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-4 pb-12 md:pt-6">
        <div className="space-y-10">
          <div id="wide-format-calculator" className="scroll-mt-24">
            <WideFormatPricingCalculator pricingConfig={pricing.config} />
          </div>

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

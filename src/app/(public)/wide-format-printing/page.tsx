import Link from 'next/link';
import { ArrowRight, Building2, ClipboardCheck, Clock3, Droplets, FileText, Ruler } from 'lucide-react';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';
import OrderWideFormatForm from '@/components/OrderWideFormatForm';
import WideFormatTrustCards from '@/components/wide-format/WideFormatTrustCards';
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
    'Материалы, интерьерная и уличная печать, постобработка и подготовка к монтажу.'
  );
  const ctaTitle = getPageContentValue(contentMap, 'cta', 'title', 'Нужна фигурная резка?');
  const ctaDescription = getPageContentValue(contentMap, 'cta', 'description', 'Перейдите к услуге плоттерной резки.');
  const ctaButtonText = getPageContentValue(contentMap, 'cta', 'buttonText', 'Перейти к плоттерной резке');

  const trustMarkers = [
    'Баннер, пленка, бумага, холст',
    'Интерьерная и уличная печать',
    'Люверсы, проклейка, резка',
    'Для офисов, сетей и агентств',
  ];
  const heroHighlights = [
    {
      title: 'Печать до 3.2 м',
      description: 'Широкие рулоны для баннеров, витрин и фасадов.',
      icon: Ruler,
    },
    {
      title: 'Запуск от 1 дня',
      description: 'Подстраиваем сроки под монтаж, акцию или открытие точки.',
      icon: Clock3,
    },
    {
      title: 'Проверка макета',
      description: 'Проверяем файл и подсказываем материал и постобработку.',
      icon: ClipboardCheck,
    },
    {
      title: 'Удобно для бизнеса',
      description: 'Счет, договор и сопровождение для юрлиц и агентств.',
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
      <Section className="pt-5 pb-4 md:pt-8 md:pb-6">
        <div className="card overflow-hidden border-neutral-200/80 bg-gradient-to-br from-white via-neutral-50 to-red-50/30 p-5 shadow-sm shadow-neutral-200/60 md:p-7 lg:p-9">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.14fr)_minmax(280px,350px)] lg:gap-8 lg:items-stretch">
            <div className="flex h-full flex-col lg:min-h-[29rem]">
              <div className="space-y-4">
                <p className="t-eyebrow inline-flex rounded-full border border-[var(--brand-red)]/15 bg-[var(--brand-red)]/[0.06] px-3.5 py-1">
                  Широкоформатная печать
                </p>
                <h1 className="max-w-3xl text-[clamp(2.35rem,5.2vw,4.05rem)] font-bold leading-[1.01] tracking-[-0.035em] text-neutral-900">
                  {heroTitle}
                </h1>
                <p className="max-w-[41rem] text-sm leading-6 text-neutral-600 md:text-[1.05rem] md:leading-7">
                  {heroDescription} Поможем быстро согласовать материал, формат и запуск в нужный срок.
                </p>
              </div>

              <div className="mt-7 flex flex-1 flex-col justify-end gap-4 lg:pt-7">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="#wide-format-calculator"
                    className="btn-primary min-h-11 gap-2 px-5 py-3 text-sm no-underline shadow-[0_12px_24px_-18px_rgba(220,38,38,0.55)]"
                  >
                    Рассчитать стоимость
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    href="#wide-format-form"
                    className="btn-secondary min-h-11 border-neutral-200 bg-white/80 px-5 py-3 text-sm text-neutral-700 no-underline"
                  >
                    Отправить параметры
                  </Link>
                </div>

                <div className="space-y-3 border-t border-neutral-200/80 pt-4">
                  <p className="max-w-lg text-sm leading-6 text-neutral-500">
                    Подскажем по материалам, подготовке макета и постобработке до запуска в печать.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Подходит для</p>
                    <span className="h-px flex-1 bg-neutral-200/80" aria-hidden="true" />
                  </div>
                  <div className="grid max-w-[34rem] gap-2 sm:grid-cols-2">
                    {trustMarkers.map((marker) => (
                      <span
                        key={marker}
                        className="chip-elevated inline-flex min-h-8 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/75 px-3.5 py-1.5 text-[11px] font-semibold text-neutral-700 shadow-none md:text-xs"
                      >
                        <span className="card-dot h-1.5 w-1.5" aria-hidden="true" />
                        {marker}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full rounded-[1.75rem] border border-neutral-200/70 bg-white/75 p-4 shadow-[0_10px_26px_-28px_rgba(15,23,42,0.38)] backdrop-blur-sm md:p-5">
              <div className="flex items-start justify-between gap-3 border-b border-neutral-200/70 pb-3.5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-red)]">Производственный профиль</p>
                  <p className="mt-1 text-sm leading-5 text-neutral-500">Ключевые параметры услуги.</p>
                </div>
                <div className="inline-flex size-9 items-center justify-center rounded-2xl bg-red-50/80 text-[var(--brand-red)]">
                  <Droplets size={18} strokeWidth={1.9} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {heroHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-neutral-200/70 bg-white/70 p-4 transition-colors duration-200 hover:border-neutral-300 hover:bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-[2.25rem] w-[2.25rem] shrink-0 items-center justify-center rounded-xl border border-[var(--brand-red)]/10 bg-[var(--brand-red)]/[0.07] text-[var(--brand-red)]">
                          <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
                        </span>
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-semibold leading-5 text-neutral-900">{item.title}</h3>
                          <p className="text-sm leading-[1.45] text-neutral-600">{item.description}</p>
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

      <Section className="pt-4 pb-14 md:pt-6 md:pb-16">
        <div className="space-y-10">
          <div id="wide-format-calculator" className="scroll-mt-24">
            <WideFormatPricingCalculator pricingConfig={pricing.config} />
          </div>

          <div className="card border-neutral-200/80 bg-neutral-50/70 p-5 md:p-7">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
              <div className="max-w-2xl space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Связанная услуга</p>
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{ctaTitle}</h2>
                <p className="text-sm leading-6 text-neutral-600 md:text-base">{ctaDescription}</p>
              </div>
              <div className="flex w-full md:w-auto md:justify-end">
                <Link href="/plotter-cutting" className="btn-primary w-full text-center no-underline md:w-auto">{ctaButtonText}</Link>
              </div>
            </div>
          </div>

          <section className="mt-10 rounded-2xl border border-neutral-200/70 bg-muted/30 p-6 md:p-8">
            <h3 className="text-xl font-semibold tracking-tight md:text-2xl">Почему выбирают нас</h3>
            <WideFormatTrustCards features={features} />
          </section>

          <OrderWideFormatForm />
        </div>
      </Section>
    </div>
  );
}

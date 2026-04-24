import Link from 'next/link';
import { Building2, ClipboardCheck, Clock3, Droplets, FileText, Ruler } from 'lucide-react';
import Section from '@/components/Section';
import WideFormatPricingCalculator from '@/components/WideFormatPricingCalculator';
import OrderWideFormatForm from '@/components/OrderWideFormatForm';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
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
    'Баннеров, плёнок, бумаги и холста',
    'Интерьерной и уличной печати',
    'Люверсов, проклейки и резки',
    'Офисов, сетей и агентств',
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
      description: 'Проверяем технические требования файла перед печатью.',
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
      icon: 'building',
    },
    {
      title: 'Технический контроль',
      description: 'Проверяем параметры заказа и ведём его по этапам производства.',
      icon: 'check',
    },
    {
      title: 'Контроль цвета',
      description: 'Калиброванное оборудование и точность передачи.',
      icon: 'drops',
    },
    {
      title: 'Работа по договору',
      description: 'Заключаем официальный договор при необходимости.',
      icon: 'file',
    },
  ] as const;
  const calculatorMarkers = [
    'Расчёт в реальном времени',
    'Площадь и постобработка в одном блоке',
    'Переход к заявке без повторного ввода',
  ] as const;

  return (
    <div className="pb-12 md:pb-16">
      <Section spacing="compact">
        <PageHero className="border-neutral-200/80 bg-gradient-to-br from-white via-neutral-50/65 to-red-50/[0.16] p-5 shadow-sm shadow-neutral-200/60 dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717] dark:shadow-none md:p-7 lg:p-9" contentClassName="flex h-full flex-col lg:min-h-[29rem]" mediaClassName="h-full" media={
          <HeroMediaPanel className="hidden h-full flex-col border-neutral-200/90 bg-neutral-100/90 p-3.5 shadow-[0_10px_26px_-28px_rgba(15,23,42,0.38)] backdrop-blur-sm dark:border-neutral-800/90 dark:bg-neutral-900/90 dark:shadow-none md:p-5 lg:flex">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200/70 pb-3.5 dark:border-neutral-800/80">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-red)]">Производственный профиль</p>
              </div>
              <div className="public-icon-badge">
                <Droplets size={18} strokeWidth={1.9} aria-hidden="true" />
              </div>
            </div>

            <div className="mt-3 grid flex-1 content-start gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {heroHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="card-structured rounded-xl border-neutral-200/90 bg-white/80 p-3 transition-colors duration-200 hover:border-neutral-300 hover:bg-white/90 dark:bg-neutral-900/70 md:p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="public-icon-badge shrink-0">
                        <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold leading-5 text-neutral-900 dark:text-neutral-100">{item.title}</h3>
                        <p className="text-xs leading-[1.45] text-neutral-600 dark:text-neutral-300 md:text-sm">{item.description}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </HeroMediaPanel>
        }>
          <div className="space-y-3 md:space-y-4">
            <HeroEyebrow>Экосольвентная печать</HeroEyebrow>
            <HeroTitle className="max-w-3xl text-[1.75rem] leading-[1.06] sm:text-[1.9rem] md:text-5xl">{heroTitle}</HeroTitle>
            <HeroLead className="max-w-[41rem] text-[13px] leading-5 text-neutral-600 dark:text-neutral-300 sm:text-sm sm:leading-6 md:text-[1.05rem] md:leading-7">
              {heroDescription} Поможем согласовать материал, формат и постобработку под вашу задачу.
            </HeroLead>
            <HeroActions className="pt-1 lg:hidden">
              <Link
                href="#wide-format-calculator"
                className="btn-primary min-h-11 w-full gap-2 px-5 py-3 text-sm font-semibold no-underline shadow-[0_12px_24px_-18px_rgba(220,38,38,0.55)]"
              >
                Рассчитать стоимость
              </Link>
            </HeroActions>
          </div>

          <div className="mt-4 hidden flex-1 flex-col justify-end gap-3.5 sm:mt-5 lg:mt-6 lg:flex lg:gap-4 lg:pt-7">
            <div className="space-y-2.5 border-t border-neutral-200/80 pt-3 dark:border-neutral-800/80 sm:space-y-3 sm:pt-4">
              <p className="max-w-xl text-xs leading-5 text-neutral-500 dark:text-neutral-400 sm:text-sm sm:leading-6">
                Подскажем по материалам, постобработке и требованиям к файлу перед печатью.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">Подходит для</p>
                <span className="h-px flex-1 bg-neutral-200/80 dark:bg-neutral-800/80" aria-hidden="true" />
              </div>
              <HeroChipList className="max-w-[34rem] gap-1.5 sm:gap-2">
                {trustMarkers.map((marker) => (
                  <HeroChip key={marker} className="chip-elevated min-h-7 gap-1.5 border-neutral-200/70 bg-white/70 px-2 py-1 text-[10px] font-medium text-neutral-600 shadow-none dark:border-neutral-700/80 dark:bg-neutral-900/75 dark:text-neutral-200 sm:min-h-8 sm:px-2.5 sm:py-1.5 sm:text-[11px] md:text-xs">
                    <span className="card-dot h-1 w-1 sm:h-1.5 sm:w-1.5" aria-hidden="true" />
                    {marker}
                  </HeroChip>
                ))}
              </HeroChipList>
            </div>

            <HeroActions className="gap-2.5 sm:gap-3">
              <Link
                href="#wide-format-calculator"
                className="btn-primary min-h-11 gap-2 px-5 py-3 text-sm font-semibold no-underline shadow-[0_12px_24px_-18px_rgba(220,38,38,0.55)]"
              >
                Рассчитать стоимость
              </Link>
              <Link
                href="#wide-format-form"
                className="min-h-11 rounded-xl border border-neutral-200/90 bg-white/75 px-5 py-3 text-center text-sm font-medium text-neutral-700 no-underline transition-colors hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-900"
              >
                Отправить параметры
              </Link>
            </HeroActions>
          </div>
        </PageHero>

        <div className="mt-3 space-y-3 lg:hidden">
          <section className="rounded-2xl border border-neutral-200/80 bg-white/70 p-3 dark:border-neutral-800/85 dark:bg-neutral-900/65">
            <p className="mb-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              Подскажем по материалам, постобработке и требованиям к файлу перед печатью.
            </p>
            <Link
              href="#wide-format-form"
              className="mb-2.5 inline-flex text-xs font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900 dark:text-neutral-200 dark:decoration-neutral-600 dark:hover:text-neutral-100"
            >
              Отправить параметры
            </Link>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">Подходит для</p>
              <span className="h-px flex-1 bg-neutral-200/80 dark:bg-neutral-800/80" aria-hidden="true" />
            </div>
            <HeroChipList className="max-w-none gap-1.5">
              {trustMarkers.map((marker) => (
                <HeroChip key={marker} className="chip-elevated min-h-7 gap-1.5 border-neutral-200/70 bg-white/70 px-2 py-1 text-[10px] font-medium text-neutral-600 shadow-none dark:border-neutral-700/80 dark:bg-neutral-900/75 dark:text-neutral-200">
                  <span className="card-dot h-1 w-1" aria-hidden="true" />
                  {marker}
                </HeroChip>
              ))}
            </HeroChipList>
          </section>

          <section className="rounded-2xl border border-neutral-200/80 bg-white/70 p-3.5 dark:border-neutral-800/85 dark:bg-neutral-900/65">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-red)]">Производственный профиль</p>
              <span className="public-icon-badge-sm">
                <Droplets size={14} strokeWidth={2} aria-hidden="true" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {heroHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 dark:border-neutral-800/90 dark:bg-neutral-900/70">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Icon size={14} strokeWidth={2} className="text-[var(--brand-red)]" aria-hidden="true" />
                      <h3 className="text-[11px] font-semibold leading-4 text-neutral-900 dark:text-neutral-100">{item.title}</h3>
                    </div>
                    <p className="text-[10px] leading-4 text-neutral-600 dark:text-neutral-300">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </Section>

      <Section spacing="tight">
        <div className="space-y-8 md:space-y-10">
          <div id="wide-format-calculator" className="scroll-mt-24">
            <div className="mb-4 space-y-3 md:mb-5">
              <p className="t-eyebrow">Калькулятор</p>
              <h2 className="t-h2">Технический расчёт стоимости</h2>
              <p className="max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
                Укажите материал, размеры и тираж, чтобы получить предварительную стоимость и сразу передать параметры в форму заявки.
              </p>
              <div className="flex flex-wrap gap-2">
                {calculatorMarkers.map((marker) => (
                  <span
                    key={marker}
                    className="inline-flex items-center rounded-full border border-neutral-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-neutral-300"
                  >
                    {marker}
                  </span>
                ))}
              </div>
            </div>
            <WideFormatPricingCalculator pricingConfig={pricing.config} />
          </div>

          <div className="cta-shell card border-neutral-200/85">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
              <div className="max-w-2xl space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-red)]">Связанная услуга</p>
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{ctaTitle}</h2>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">{ctaDescription}</p>
              </div>
              <div className="flex w-full md:w-auto md:justify-end">
                <Link href="/plotter-cutting" className="btn-primary w-full text-center no-underline md:w-auto">{ctaButtonText}</Link>
              </div>
            </div>
          </div>

          <section className="card p-5 md:p-8">
            <div className="space-y-2">
              <p className="t-eyebrow">Преимущества</p>
              <h3 className="text-xl font-semibold tracking-tight md:text-2xl">Почему выбирают нас</h3>
            </div>
            <WideFormatTrustCards features={features} />
          </section>

          <OrderWideFormatForm />
        </div>
      </Section>
    </div>
  );
}

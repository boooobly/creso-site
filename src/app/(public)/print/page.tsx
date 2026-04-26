import Link from 'next/link';
import ProtectedImage from '@/components/ui/ProtectedImage';
import PrintPricingCalculator from '@/components/PrintPricingCalculator';
import Section from '@/components/Section';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import { getSiteImage } from '@/lib/site-images';
import type { Metadata } from 'next';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';

const featureChips = [
  'Тиражи от 1 000 до 9 000 шт.',
  'Ламинация +15%',
  'Можно заказать дизайн',
  'Флаеры — по запросу',
] as const;


export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Печать визиток и полиграфии | CredoMir',
  description: 'Офсетная печать визиток и полиграфии с фиксированными параметрами и предсказуемыми сроками.',
  path: '/print',
});

export default async function PrintPage() {
  const heroImage = await getSiteImage('print.hero.main');

  const heroImageSrc = heroImage?.url ?? '/images/bussinescard/hero.png';
  const heroImageAlt = heroImage?.altText || 'Офсетные визитки с фиксированными параметрами печати';

  return (
    <div className="pb-12 md:pb-16">
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Главная', path: '/' }, { name: 'Услуги', path: '/services' }, { name: 'Печать полиграфии', path: '/print' }])} />
      <JsonLd data={buildServiceJsonLd('Печать полиграфии', 'Офсетная печать визиток и другой полиграфии с прогнозируемыми сроками.', '/print')} />
      <Section spacing="compact" className="pb-4 md:pb-5">
        <PageHero
          className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/20 dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717]"
          contentClassName="flex h-full max-w-[37rem] flex-col gap-5 md:gap-6"
          media={
            <HeroMediaPanel className="overflow-hidden rounded-[1.4rem] border-neutral-200/85 bg-neutral-900 p-0">
              <div className="relative aspect-[6/5] max-h-[17.5rem] w-full overflow-hidden rounded-[inherit] sm:max-h-none">
                <ProtectedImage
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  className="h-full w-full object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                />
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-2xl border border-white/30 bg-black/35 px-3 py-2.5 backdrop-blur-sm shadow-[0_14px_34px_-24px_rgba(2,6,23,0.9)] md:bottom-5 md:left-5 md:right-5 md:px-4 md:py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">Фиксированный офсет</p>
                <p className="mt-1 text-sm font-semibold text-white">Стабильный результат для корпоративных тиражей</p>
              </div>
            </HeroMediaPanel>
          }
        >
          <div className="space-y-4">
            <HeroEyebrow className="w-fit rounded-full border border-[var(--brand-red)]/55 px-3 py-1 text-[var(--brand-red)]">
              Визитки и флаеры
            </HeroEyebrow>
            <HeroTitle className="max-w-[16ch] text-[1.9rem] leading-[1.08] md:text-5xl">Офсетные визитки для бизнеса</HeroTitle>
            <HeroLead className="max-w-[34rem] text-sm leading-6 md:text-[1.05rem] md:leading-relaxed">
              Быстрый расчёт для стандартных тиражей: выберите параметры, получите итоговую стоимость и отправьте заявку в одном потоке.
            </HeroLead>
          </div>

          <HeroChipList className="max-w-[36rem] gap-2">
            {featureChips.map((chip) => (
              <HeroChip
                key={chip}
                className="min-h-9 rounded-xl border-neutral-200 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200 sm:min-h-10 sm:px-3.5 sm:text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                {chip}
              </HeroChip>
            ))}
          </HeroChipList>

          <HeroActions className="gap-3.5">
            <Link
              href="#print-calculator"
              data-floating-cta-hide
              className="btn-primary px-5 py-3 text-sm no-underline shadow-[0_8px_20px_rgba(220,38,38,0.24)] hover:shadow-[0_10px_24px_rgba(220,38,38,0.28)]"
            >
              Рассчитать стоимость
            </Link>
            <Link
              href="#print-order-form"
              data-floating-cta-hide
              className="btn-secondary border-neutral-200 bg-white/80 px-5 py-3 text-sm text-neutral-700 no-underline dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200"
            >
              Отправить заявку
            </Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section spacing="tight" className="pt-0">
        <div id="print-calculator" className="min-w-0 scroll-mt-24 space-y-4 md:space-y-5">
          <div className="min-w-0 space-y-2">
            <p className="t-eyebrow">Калькулятор и тарифы</p>
            <h2 className="t-h2">Рассчитайте стоимость и сразу передайте параметры в заявку</h2>
            <p className="max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
              Используйте тарифную таблицу как ориентир, затем настройте заказ в конфигураторе.
            </p>
            <p className="max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
              Для отдельной страницы под локальный запрос перейдите в раздел <Link href="/business-cards" className="underline decoration-neutral-300 underline-offset-4">печать визиток в Невинномысске</Link>.
            </p>
          </div>
          <PrintPricingCalculator />
        </div>
      </Section>
    </div>
  );
}

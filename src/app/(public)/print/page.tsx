import Link from 'next/link';
import ProtectedImage from '@/components/ui/ProtectedImage';
import PrintPricingCalculator from '@/components/PrintPricingCalculator';
import Section from '@/components/Section';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import { getSiteImage } from '@/lib/site-images';

const featureChips = [
  'Формат 90×50 мм',
  'Офсетная печать: 1 или 2 стороны',
  'Мелованный картон 300 gsm',
  'Тиражи от 1 000 до 9 000 шт.',
  'Срок 7–10 рабочих дней',
] as const;

export default async function PrintPage() {
  const heroImage = await getSiteImage('print.hero.main');

  const heroImageSrc = heroImage?.url ?? '/images/bussinescard/hero.png';
  const heroImageAlt = heroImage?.altText || 'Офсетные визитки с фиксированными параметрами печати';

  return (
    <div className="pb-8 md:pb-10">
      <Section spacing="compact" className="pb-4 md:pb-5">
        <PageHero
          className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/20"
          contentClassName="flex h-full max-w-[37rem] flex-col gap-6"
          media={
            <HeroMediaPanel className="overflow-hidden rounded-[1.4rem] border-neutral-200/85 bg-neutral-900 p-0">
              <div className="relative aspect-[6/5] w-full overflow-hidden rounded-[inherit]">
                <ProtectedImage
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  className="h-full w-full object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                />
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-2xl border border-white/30 bg-black/35 px-4 py-3 backdrop-blur-sm shadow-[0_14px_34px_-24px_rgba(2,6,23,0.9)] md:bottom-5 md:left-5 md:right-5">
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
            <HeroTitle className="max-w-[16ch] text-3xl leading-[1.06] md:text-5xl">Офсетные визитки для бизнеса</HeroTitle>
            <HeroLead className="max-w-[34rem] text-base md:text-[1.05rem] md:leading-relaxed">
              Фиксированные параметры без лишней сложности: формат 90×50 мм, мелованный картон 300 gsm и
              прозрачная сетка тиражей. Рассчитайте стоимость, выберите опции и сразу отправьте заявку менеджеру.
            </HeroLead>
          </div>

          <HeroChipList className="max-w-[36rem] gap-2.5">
            {featureChips.map((chip) => (
              <HeroChip
                key={chip}
                className="min-h-10 rounded-xl border-neutral-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                {chip}
              </HeroChip>
            ))}
          </HeroChipList>

          <HeroActions className="gap-3.5">
            <Link
              href="#print-calculator"
              className="btn-primary px-5 py-3 text-sm no-underline shadow-[0_8px_20px_rgba(220,38,38,0.24)] hover:shadow-[0_10px_24px_rgba(220,38,38,0.28)]"
            >
              Рассчитать стоимость
            </Link>
            <Link
              href="#print-order-form"
              className="btn-secondary border-neutral-200 bg-white/80 px-5 py-3 text-sm text-neutral-700 no-underline"
            >
              Отправить заявку
            </Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section spacing="tight" className="pt-0">
        <div id="print-calculator" className="scroll-mt-24 space-y-4 md:space-y-5">
          <div className="space-y-2">
            <p className="t-eyebrow">Калькулятор и тарифы</p>
            <h2 className="t-h2">Рассчитайте стоимость и сразу передайте параметры в заявку</h2>
            <p className="max-w-3xl text-sm leading-6 text-neutral-600 md:text-base">
              Выберите тираж, сторону печати и дополнительные опции. Итог автоматически появится в форме заявки ниже.
            </p>
          </div>
          <PrintPricingCalculator />
        </div>
      </Section>
    </div>
  );
}

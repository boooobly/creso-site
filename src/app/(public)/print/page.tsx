import PrintPricingCalculator from '@/components/PrintPricingCalculator';
import { HeroChip, HeroChipList, HeroLead, HeroTitle, PageHero } from '@/components/hero/PageHero';

const featureChips = [
  'Офсетная печать',
  '300 gsm мелованный картон',
  'Кратно 1000',
  '7–10 рабочих дней',
] as const;

export default function PrintPage() {
  return (
    <div className="space-y-6">
      <PageHero className="p-6 md:p-7 lg:p-8">
        <HeroTitle className="max-w-[20ch] text-[clamp(2rem,4vw,3rem)]">Офсетные визитки</HeroTitle>
        <HeroLead>
          Фиксированные параметры печати: 90x50 мм, мелованный картон 300 gsm. Выберите тираж и опции, затем отправьте заявку менеджеру.
        </HeroLead>

        <HeroChipList className="gap-2">
          {featureChips.map((chip) => (
            <HeroChip key={chip} className="gap-2 border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
              {chip}
            </HeroChip>
          ))}
        </HeroChipList>
      </PageHero>

      <PrintPricingCalculator />
    </div>
  );
}

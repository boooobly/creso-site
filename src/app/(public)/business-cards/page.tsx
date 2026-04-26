import Link from 'next/link';
import type { Metadata } from 'next';
import Section from '@/components/Section';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroTitle, PageHero } from '@/components/hero/PageHero';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Печать визиток в Невинномысске | CredoMir',
  description: 'Печать визиток для бизнеса и частных клиентов в Невинномысске. Помощь с макетом и подготовкой тиража.',
  path: '/business-cards',
});

export default function BusinessCardsPage() {
  return (
    <div className="pb-12 md:pb-16">
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Главная', path: '/' }, { name: 'Услуги', path: '/services' }, { name: 'Печать визиток', path: '/business-cards' }])} />
      <JsonLd data={buildServiceJsonLd('Печать визиток в Невинномысске', 'Печать визиток для компаний и частных клиентов с подготовкой макета и тиража.', '/business-cards')} />

      <Section spacing="compact">
        <PageHero className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/20 dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717]">
          <HeroEyebrow>Полиграфия</HeroEyebrow>
          <HeroTitle>Печать визиток в Невинномысске</HeroTitle>
          <HeroLead>Делаем визитки для компаний, специалистов и частных заказчиков. Помогаем подготовить макет и выбрать формат тиража под практические задачи бизнеса.</HeroLead>
          <HeroChipList>
            {['Стандартные и корпоративные визитки', 'Тиражи под задачу бизнеса', 'Помощь с дизайном и вёрсткой', 'Работаем по Невинномысску и краю'].map((item) => (
              <HeroChip key={item} className="chip-elevated text-xs sm:text-sm"><span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />{item}</HeroChip>
            ))}
          </HeroChipList>
          <HeroActions>
            <Link href="/contacts" className="btn-primary no-underline">Заказать визитки</Link>
            <Link href="/print" className="btn-secondary no-underline">Полиграфия и калькулятор</Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {['Визитки для отделов продаж и менеджеров', 'Визитки для мастеров и частных специалистов', 'Небольшие и регулярные корпоративные тиражи'].map((item) => <article key={item} className="card p-5">{item}</article>)}
        </div>
      </Section>

      <Section spacing="tight">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="card p-5 md:p-6"><h2 className="t-h3">Материалы и печать</h2><ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base"><li>• Подбираем формат и тип бумаги под сценарий использования.</li><li>• Проверяем макет перед запуском в печать.</li><li>• При необходимости помогаем с дизайном и адаптацией фирменного стиля.</li></ul></article>
          <article className="card p-5 md:p-6"><h2 className="t-h3">Как оформить заказ</h2><ol className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base"><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">1.</span> Отправляете текст, логотип и пожелания по макету.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">2.</span> Согласуем макет и параметры тиража.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">3.</span> Запускаем печать и согласуем выдачу или доставку.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">4.</span> Передаём готовый тираж с документами для юрлиц.</li></ol></article>
        </div>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="section-header"><h2 className="t-h2">FAQ</h2></div>
        <div className="space-y-3">
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Можно ли заказать небольшой тираж?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Да, подбираем тираж под задачу и частоту использования визиток.</p></article>
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Сколько стоит печать визиток?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Стоимость зависит от размера, материала и сложности макета.</p></article>
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Работаете только с компаниями?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Нет, работаем и с бизнесом, и с частными клиентами в Невинномысске и Ставропольском крае.</p></article>
        </div>
        <div className="cta-shell mt-6"><div className="section-header-split mb-0"><div><h2 className="t-h3">Нужны визитки без лишних согласований?</h2><p className="t-body text-muted-foreground max-w-2xl">Опишите задачу — предложим формат, подготовим макет и запустим тираж.</p></div><Link href="/contacts" className="btn-primary w-full justify-center no-underline sm:w-auto">Отправить запрос</Link></div></div>
      </Section>
    </div>
  );
}

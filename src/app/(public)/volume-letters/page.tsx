import Link from 'next/link';
import type { Metadata } from 'next';
import Section from '@/components/Section';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroTitle, PageHero } from '@/components/hero/PageHero';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Объёмные буквы в Невинномысске | CredoMir',
  description: 'Изготавливаем объёмные буквы для фасадов и интерьеров в Невинномысске. Подготовка макета, производство и монтаж.',
  path: '/volume-letters',
});

export default function VolumeLettersPage() {
  return (
    <div className="pb-12 md:pb-16">
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Главная', path: '/' }, { name: 'Услуги', path: '/services' }, { name: 'Объёмные буквы', path: '/volume-letters' }])} />
      <JsonLd data={buildServiceJsonLd('Объёмные буквы в Невинномысске', 'Производство объёмных букв для наружной рекламы и интерьерного оформления.', '/volume-letters')} />

      <Section spacing="compact">
        <PageHero className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/20 dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717]">
          <HeroEyebrow>Наружная реклама</HeroEyebrow>
          <HeroTitle>Объёмные буквы в Невинномысске</HeroTitle>
          <HeroLead>Изготавливаем объёмные буквы для фасадов, ресепшенов и входных зон. Подбираем формат под задачу бренда и условия размещения на объекте.</HeroLead>
          <HeroChipList>
            {['Световые и несветовые буквы', 'Фасадные и интерьерные решения', 'Помощь с дизайном и адаптацией макета', 'Производство и монтаж'].map((item) => (
              <HeroChip key={item} className="chip-elevated text-xs sm:text-sm"><span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />{item}</HeroChip>
            ))}
          </HeroChipList>
          <HeroActions>
            <Link href="/contacts" className="btn-primary no-underline">Запросить расчёт</Link>
            <Link href="/lightboxes" className="btn-secondary no-underline">Световые короба</Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {['Буквы для фасадов магазинов и офисов', 'Буквы для бренд-зон и ресепшенов', 'Логотипы и знаки сложной формы'].map((item) => (
            <article key={item} className="card p-5">{item}</article>
          ))}
        </div>
      </Section>

      <Section spacing="tight">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="card p-5 md:p-6"><h2 className="t-h3">Материалы и производство</h2><ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base"><li>• Подбираем материалы под внешний вид, бюджет и условия эксплуатации.</li><li>• Производим элементы на собственной площадке с контролем качества.</li><li>• Готовим комплект для безопасного и аккуратного монтажа.</li></ul></article>
          <article className="card p-5 md:p-6"><h2 className="t-h3">Порядок работы</h2><ol className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base"><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">1.</span> Получаем задачу и исходные данные по объекту.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">2.</span> Готовим предложение по формату, материалам и смете.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">3.</span> Согласуем макет и запускаем производство.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">4.</span> Выполняем монтаж и сдаём готовый результат.</li></ol></article>
        </div>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="section-header"><h2 className="t-h2">Почему CredoMir</h2></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{['Собственное производство', 'Практичный подход к дизайну', 'Монтаж рекламных конструкций', 'Работаем с бизнесом и частными клиентами'].map((item) => <article key={item} className="card p-5 text-sm md:text-base">{item}</article>)}</div>
      </Section>

      <Section spacing="tight">
        <div className="section-header"><h2 className="t-h2">FAQ</h2></div>
        <div className="space-y-3">
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Где можно использовать объёмные буквы?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">На фасадах, во входных группах и в интерьерах коммерческих помещений.</p></article>
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Можно ли изготовить буквы по моему макету?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Да, работаем с готовыми макетами и при необходимости помогаем доработать их под производство.</p></article>
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Сколько стоит заказ?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Стоимость зависит от размера, материала и сложности проекта.</p></article>
        </div>
        <div className="cta-shell mt-6"><div className="section-header-split mb-0"><div><h2 className="t-h3">Нужны объёмные буквы для вашего объекта?</h2><p className="t-body text-muted-foreground max-w-2xl">Опишете задачу — предложим рабочее решение для Невинномысска и Ставропольского края.</p></div><Link href="/contacts" className="btn-primary w-full justify-center no-underline sm:w-auto">Обсудить задачу</Link></div></div>
      </Section>
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import Section from '@/components/Section';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroTitle, PageHero } from '@/components/hero/PageHero';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';

const variants = [
  'Фасадные вывески для магазинов и офисов',
  'Вывески для входных групп и бизнес-центров',
  'Световые и несветовые решения под задачу',
  'Комплексное оформление с монтажом',
] as const;

const productionNotes = [
  'Подбираем основу и облицовку под место установки и бюджет проекта.',
  'Учитываем читаемость днём и вечером, формат крепления и обслуживание.',
  'Помогаем с макетом и адаптацией фирменного стиля под фасад.',
] as const;

const steps = [
  'Обсуждаем задачу: адрес, размеры, формат вывески и требования к размещению.',
  'Готовим визуальное решение и предварительный расчёт стоимости.',
  'Согласуем материалы, запускаем производство и организуем монтаж.',
  'Передаём готовую вывеску и закрывающие документы.',
] as const;

const faq = [
  {
    q: 'Сколько стоит изготовление вывески?',
    a: 'Стоимость зависит от размера, материала и сложности конструкции. После уточнения параметров подготовим расчёт с вариантами.',
  },
  {
    q: 'Можно заказать только производство без монтажа?',
    a: 'Да, можно заказать только изготовление. Также выполняем монтаж, если нужен полный цикл.',
  },
  {
    q: 'Работаете только по Невинномысску?',
    a: 'Основной регион — Невинномысск и Ставропольский край. По отдельным проектам согласуем выезд и монтаж в соседних городах.',
  },
] as const;

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Изготовление вывесок в Невинномысске | CredoMir',
  description: 'Изготавливаем вывески для бизнеса в Невинномысске: проект, производство и монтаж под задачу объекта.',
  path: '/advertising-signs',
});

export default function AdvertisingSignsPage() {
  return (
    <div className="pb-12 md:pb-16">
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Главная', path: '/' }, { name: 'Услуги', path: '/services' }, { name: 'Изготовление вывесок', path: '/advertising-signs' }])} />
      <JsonLd data={buildServiceJsonLd('Изготовление вывесок в Невинномысске', 'Производство вывесок для магазинов, офисов и коммерческих объектов с монтажом.', '/advertising-signs')} />

      <Section spacing="compact">
        <PageHero className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/20 dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717]">
          <HeroEyebrow>Наружная реклама</HeroEyebrow>
          <HeroTitle>Изготовление вывесок в Невинномысске</HeroTitle>
          <HeroLead>
            Делаем вывески для магазинов, салонов, офисов и производственных площадок. Помогаем пройти путь от идеи и макета до готовой конструкции на объекте.
          </HeroLead>
          <HeroChipList>
            {variants.map((item) => (
              <HeroChip key={item} className="chip-elevated text-xs sm:text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />
                {item}
              </HeroChip>
            ))}
          </HeroChipList>
          <HeroActions>
            <Link href="/contacts" className="btn-primary no-underline">Обсудить проект</Link>
            <Link href="/outdoor-advertising" className="btn-secondary no-underline">Все услуги наружной рекламы</Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="section-header">
          <h2 className="t-h2">Что мы изготавливаем</h2>
          <p className="t-body text-muted-foreground max-w-3xl">Решения для локального бизнеса в Невинномысске и по Ставропольскому краю.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {variants.map((item) => (
            <article key={item} className="card p-5">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{item}</h3>
            </article>
          ))}
        </div>
      </Section>

      <Section spacing="tight">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="card p-5 md:p-6">
            <h2 className="t-h3">Материалы и производство</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">
              {productionNotes.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </article>
          <article className="card p-5 md:p-6">
            <h2 className="t-h3">Как проходит заказ</h2>
            <ol className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">
              {steps.map((item, index) => <li key={item}><span className="font-semibold text-neutral-900 dark:text-neutral-100">{index + 1}.</span> {item}</li>)}
            </ol>
          </article>
        </div>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="section-header">
          <h2 className="t-h2">Почему выбирают CredoMir</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['Собственное производство', 'Помощь с дизайном и подготовкой макета', 'Изготовление и монтаж рекламы под ключ', 'Работаем с бизнесом и частными клиентами'].map((item) => (
            <article key={item} className="card p-5 text-sm md:text-base">{item}</article>
          ))}
        </div>
      </Section>

      <Section spacing="tight">
        <div className="section-header">
          <h2 className="t-h2">FAQ</h2>
        </div>
        <div className="space-y-3">
          {faq.map((item) => (
            <article key={item.q} className="card p-5 md:p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{item.q}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">{item.a}</p>
            </article>
          ))}
        </div>

        <div className="cta-shell mt-6">
          <div className="section-header-split mb-0">
            <div>
              <h2 className="t-h3">Нужна вывеска под ваш объект?</h2>
              <p className="t-body text-muted-foreground max-w-2xl">Напишите задачу — предложим формат и подготовим расчёт. Также доступны световые короба и объёмные буквы.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link href="/contacts" className="btn-primary w-full justify-center no-underline sm:w-auto">Оставить заявку</Link>
              <Link href="/lightboxes" className="btn-secondary w-full justify-center no-underline sm:w-auto">Световые короба</Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import Section from '@/components/Section';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroTitle, PageHero } from '@/components/hero/PageHero';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';

const variants = ['Баннеры для фасадов и входных групп', 'Баннеры для акций и сезонных предложений', 'Интерьерные баннеры для ТЦ, стоек и офисов', 'Баннеры для строительных ограждений и временных площадок'] as const;
const materials = ['Подбираем баннерную ткань под улицу, интерьер или короткую рекламную кампанию.', 'Согласовываем размер, чтобы макет читался с реальной дистанции у точки размещения.', 'Делаем постобработку под ваш монтаж: люверсы, проклейка краёв, рез по нужному формату.'] as const;
const steps = ['Вы присылаете размеры, фото места и кратко описываете задачу.', 'Предлагаем материал, проверяем макет и уточняем, как будет крепиться баннер.', 'Печатаем и подготавливаем изделие к установке.', 'Передаём заказ или подключаем монтажную бригаду при необходимости.'] as const;

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Печать баннеров в Невинномысске — от 1 заказа | CredoMir',
  description: 'Печать баннеров для фасадов, акций и навигации в Невинномысске: подбор материала, люверсы, проклейка и подготовка к монтажу.',
  path: '/banner-printing',
});

export default function BannerPrintingPage() {
  return (
    <div className="pb-12 md:pb-16">
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Главная', path: '/' }, { name: 'Услуги', path: '/services' }, { name: 'Печать баннеров', path: '/banner-printing' }])} />
      <JsonLd data={buildServiceJsonLd('Печать баннеров в Невинномысске', 'Широкоформатная печать баннеров для улицы и интерьера с люверсами и проклейкой.', '/banner-printing')} />

      <Section spacing="compact">
        <PageHero className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/20 dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717]">
          <HeroEyebrow>Широкоформатная печать</HeroEyebrow>
          <HeroTitle>Печать баннеров в Невинномысске</HeroTitle>
          <HeroLead>Печатаем баннеры для бизнеса и частных клиентов: от локальных акций до постоянного оформления фасадов. Подскажем материал под вашу задачу и условия эксплуатации.</HeroLead>
          <HeroChipList>
            {variants.map((item) => (
              <HeroChip key={item} className="chip-elevated text-xs sm:text-sm"><span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />{item}</HeroChip>
            ))}
          </HeroChipList>
          <HeroActions>
            <Link href="/contacts" className="btn-primary no-underline">Рассчитать баннер</Link>
            <Link href="/wide-format-printing" className="btn-secondary no-underline">Все услуги печати</Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="section-header"><h2 className="t-h2">Какие баннеры чаще всего заказывают</h2></div>
        <div className="grid gap-4 md:grid-cols-2">{variants.map((item) => <article key={item} className="card p-5">{item}</article>)}</div>
      </Section>

      <Section spacing="tight">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="card p-5 md:p-6"><h2 className="t-h3">Что важно учесть до печати</h2><ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">{materials.map((item) => <li key={item}>• {item}</li>)}</ul></article>
          <article className="card p-5 md:p-6"><h2 className="t-h3">Как мы ведём заказ</h2><ol className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">{steps.map((item, i) => <li key={item}><span className="font-semibold text-neutral-900 dark:text-neutral-100">{i + 1}.</span> {item}</li>)}</ol></article>
        </div>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="section-header"><h2 className="t-h2">Почему выбирают CredoMir</h2></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{['Собственное производство в Невинномысске', 'Помощь с подготовкой макета', 'Печать и монтаж рекламных конструкций', 'Работаем по Невинномысску и Ставропольскому краю'].map((item) => <article key={item} className="card p-5 text-sm md:text-base">{item}</article>)}</div>
      </Section>

      <Section spacing="tight">
        <div className="section-header"><h2 className="t-h2">FAQ</h2></div>
        <div className="space-y-3">
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Какая цена на баннер?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Стоимость зависит от размера, материала и сложности постобработки.</p></article>
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Можно напечатать срочный заказ?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Сроки зависят от загруженности и параметров проекта. Подскажем реальный срок после уточнения задачи.</p></article>
          <article className="card p-5 md:p-6"><h3 className="font-semibold">Вы помогаете с макетом?</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">Да, можем помочь с дизайном и технической подготовкой файла к печати.</p></article>
        </div>
        <div className="cta-shell mt-6"><div className="section-header-split mb-0"><div><h2 className="t-h3">Нужен баннер для новой акции или постоянной вывески?</h2><p className="t-body text-muted-foreground max-w-2xl">Подскажем оптимальный материал и подготовим макет под ваш адрес и формат крепления.</p></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><Link href="/contacts" className="btn-primary w-full justify-center no-underline sm:w-auto">Получить консультацию</Link><Link href="/wide-format-printing" className="btn-secondary w-full justify-center no-underline sm:w-auto">К широкоформатной печати</Link></div></div></div>
      </Section>
    </div>
  );
}

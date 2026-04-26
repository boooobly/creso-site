import Link from 'next/link';
import type { Metadata } from 'next';
import Section from '@/components/Section';
import { HeroActions, HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroTitle, PageHero } from '@/components/hero/PageHero';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Световые короба в Невинномысске | CredoMir',
  description: 'Производство световых коробов для фасадов и входных групп в Невинномысске с подбором материалов и монтажом.',
  path: '/lightboxes',
});

export default function LightboxesPage() {
  const faq = [
    ['Для каких объектов подходят лайтбоксы?', 'Для магазинов, аптек, салонов, кафе и других точек, где важна заметность в вечернее время.'],
    ['Можно сделать короб в фирменных цветах?', 'Да, подбираем оформление под брендбук и адаптируем макет под размеры конструкции.'],
    ['Что влияет на стоимость?', 'Стоимость зависит от размера, материала и сложности изготовления.'],
  ] as const;

  return (
    <div className="pb-12 md:pb-16">
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Главная', path: '/' }, { name: 'Услуги', path: '/services' }, { name: 'Световые короба', path: '/lightboxes' }])} />
      <JsonLd data={buildServiceJsonLd('Световые короба в Невинномысске', 'Изготавливаем световые короба для наружной рекламы: производство, подготовка макета и монтаж.', '/lightboxes')} />

      <Section spacing="compact">
        <PageHero className="border border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50 to-red-50/20 dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717]">
          <HeroEyebrow>Наружная реклама</HeroEyebrow>
          <HeroTitle>Световые короба в Невинномысске</HeroTitle>
          <HeroLead>Производим световые короба для фасадов и входных групп. Подбираем конструкцию под место установки, помогаем с макетом и выполняем монтаж.</HeroLead>
          <HeroChipList>
            {['Односторонние и двусторонние короба', 'Для улицы и входных групп', 'Производство и монтаж под ключ', 'Работаем по Невинномысску и краю'].map((item) => (
              <HeroChip key={item} className="chip-elevated text-xs sm:text-sm"><span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-red)]" aria-hidden="true" />{item}</HeroChip>
            ))}
          </HeroChipList>
          <HeroActions>
            <Link href="/contacts" className="btn-primary no-underline">Получить расчёт</Link>
            <Link href="/outdoor-advertising" className="btn-secondary no-underline">Другие форматы наружной рекламы</Link>
          </HeroActions>
        </PageHero>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="card p-5 md:p-6"><h2 className="t-h3">Варианты исполнения</h2><ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base"><li>• Короба для фасадных вывесок</li><li>• Короба для входных групп</li><li>• Компактные решения для навигации</li><li>• Брендированные конструкции под фирменный стиль</li></ul></article>
          <article className="card p-5 md:p-6"><h2 className="t-h3">Материалы и производство</h2><ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base"><li>• Подбираем основу и лицевую поверхность под условия эксплуатации.</li><li>• Учитываем удобство обслуживания и читаемость с нужной дистанции.</li><li>• Собираем конструкцию на собственном производстве и проверяем перед монтажом.</li></ul></article>
        </div>
      </Section>

      <Section spacing="tight">
        <article className="card p-5 md:p-6"><h2 className="t-h3">Как проходит заказ</h2><ol className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base"><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">1.</span> Уточняем задачу, адрес и формат размещения.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">2.</span> Предлагаем конструкцию и готовим расчёт.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">3.</span> Согласуем макет и запускаем производство.</li><li><span className="font-semibold text-neutral-900 dark:text-neutral-100">4.</span> Организуем монтаж и сдаём проект.</li></ol></article>
      </Section>

      <Section spacing="tight" background="muted" fullBleed>
        <div className="section-header"><h2 className="t-h2">FAQ</h2></div>
        <div className="space-y-3">{faq.map(([q, a]) => <article key={q} className="card p-5 md:p-6"><h3 className="font-semibold">{q}</h3><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 md:text-base">{a}</p></article>)}</div>
        <div className="cta-shell mt-6"><div className="section-header-split mb-0"><div><h2 className="t-h3">Нужен световой короб для точки продаж?</h2><p className="t-body text-muted-foreground max-w-2xl">Подготовим решение под ваш фасад и задачу. Также изготавливаем объёмные буквы.</p></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><Link href="/contacts" className="btn-primary w-full justify-center no-underline sm:w-auto">Связаться с менеджером</Link><Link href="/volume-letters" className="btn-secondary w-full justify-center no-underline sm:w-auto">Объёмные буквы</Link></div></div></div>
      </Section>
    </div>
  );
}

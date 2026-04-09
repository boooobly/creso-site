import Section from '@/components/Section';
import PortfolioGrid from '@/components/PortfolioGrid';
import ProtectedImage from '@/components/ui/ProtectedImage';
import { HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroTitle, PageHero } from '@/components/hero/PageHero';
import localItems from '@/data/portfolio.json';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getPublicPortfolioItems } from '@/lib/public-portfolio';
import type { PortfolioItem } from '@/types';

const PLACEHOLDER_IMAGE = '/og-image.png';
const UNCATEGORIZED_LABEL = 'Без категории';

function normalizeItem(item: any, index: number): PortfolioItem {
  const category = String(item?.category ?? '').trim() || UNCATEGORIZED_LABEL;
  const shortDescription = String(item?.shortDescription ?? '').trim();
  const image = String(item?.image ?? '').trim() || PLACEHOLDER_IMAGE;

  const galleryImages = Array.isArray(item?.galleryImages)
    ? item.galleryImages.map((entry: unknown) => String(entry ?? '').trim()).filter(Boolean)
    : [];

  return {
    id: String(item?.id ?? `portfolio-${index}`),
    slug: String(item?.slug ?? item?.id ?? `portfolio-${index}`),
    title: String(item?.title ?? 'Проект'),
    category,
    shortDescription,
    image,
    featured: Boolean(item?.featured),
    sortOrder: typeof item?.sortOrder === 'number' ? item.sortOrder : index,
    galleryImages,
  };
}

export default async function PortfolioPage() {
  const [rawItems, contentMap] = await Promise.all([
    getPublicPortfolioItems().catch(() => localItems as any[]),
    getPageContentMap('portfolio'),
  ]);

  const items = rawItems.map(normalizeItem);
  const featuredItem = items.find((item) => item.featured);

  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Портфолио');
  const heroDescription = getPageContentValue(
    contentMap,
    'hero',
    'description',
    'Примеры реализованных проектов по печати, вывескам и рекламным конструкциям.'
  );

  const uniqueCategoriesCount = new Set(items.map((item) => item.category)).size;
  const heroFacts = [
    `Опубликованных проектов: ${items.length}`,
    `Категорий: ${uniqueCategoriesCount}`,
    featuredItem ? 'Есть выделенный кейс' : 'Все кейсы из админки',
  ];

  return (
    <div className="pb-8 md:pb-12">
      <Section spacing="compact">
        <PageHero className="border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50/70 to-red-50/[0.16] p-5 shadow-sm shadow-neutral-200/60 md:p-7 lg:p-8">
          <div className="space-y-4">
            <HeroEyebrow>Реальные кейсы производства</HeroEyebrow>
            <HeroTitle className="max-w-4xl text-3xl md:text-5xl">{heroTitle}</HeroTitle>
            <HeroLead className="max-w-[44rem] text-sm leading-6 md:text-[1.02rem] md:leading-7">{heroDescription}</HeroLead>
          </div>

          <div className="mt-6 border-t border-neutral-200/80 pt-4 md:pt-5">
            <HeroChipList className="gap-2">
              {heroFacts.map((fact) => (
                <HeroChip key={fact} className="chip-elevated min-h-8 border-neutral-200/85 bg-white/75 px-3 py-1.5 text-[11px] shadow-none md:text-xs">
                  {fact}
                </HeroChip>
              ))}
            </HeroChipList>
          </div>
        </PageHero>
      </Section>

      {featuredItem ? (
        <Section spacing="tight">
          <article className="card-visual overflow-hidden border-neutral-200/85 bg-white/90 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.45)]">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
              <div className="relative min-h-[240px] md:min-h-[320px]">
                <ProtectedImage
                  src={featuredItem.image}
                  alt={featuredItem.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>

              <div className="flex flex-col justify-center gap-4 p-5 md:p-7 lg:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-red)]">Выделенный кейс</p>
                <div className="space-y-2">
                  <span className="inline-flex w-fit items-center rounded-full border border-red-200/70 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200">
                    {featuredItem.category}
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-[1.9rem]">{featuredItem.title}</h2>
                  <p className="text-sm leading-6 text-neutral-600 md:text-base">
                    {featuredItem.shortDescription || 'Описание проекта пока добавляется в админ-панели.'}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </Section>
      ) : null}

      <Section spacing="tight">
        <PortfolioGrid items={items} />
      </Section>
    </div>
  );
}

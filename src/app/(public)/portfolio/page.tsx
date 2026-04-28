import Section from '@/components/Section';
import PortfolioGrid from '@/components/PortfolioGrid';
import ProtectedImage from '@/components/ui/ProtectedImage';
import { HeroChip, HeroChipList, HeroEyebrow, HeroLead, HeroMediaPanel, HeroTitle, PageHero } from '@/components/hero/PageHero';
import localItems from '@/data/portfolio.json';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getPublicPortfolioItems } from '@/lib/public-portfolio';
import type { PortfolioItem } from '@/types';
import type { Metadata } from 'next';
import { buildPublicPageMetadata } from '@/lib/seo';

const PLACEHOLDER_IMAGE = '/og-image.png';
const UNCATEGORIZED_LABEL = 'Без категории';

function normalizeItem(item: any, index: number): PortfolioItem {
  const category = String(item?.category ?? '').trim() || UNCATEGORIZED_LABEL;
  const shortDescription = String(item?.shortDescription ?? '').trim();
  const image = String(item?.image ?? '').trim() || PLACEHOLDER_IMAGE;

  const galleryImages = Array.isArray(item?.galleryImages)
    ? item.galleryImages
        .map((entry: unknown) => {
          if (typeof entry === 'string') {
            return entry.trim();
          }

          if (!entry || typeof entry !== 'object') {
            return '';
          }

          return String((entry as { url?: unknown }).url ?? '').trim();
        })
        .filter(Boolean)
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


export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Портфолио наружной рекламы и печати | CredoMir',
  description: 'Портфолио CredoMir: вывески, световые короба, объёмные буквы, печать и фрезеровка для проектов в Невинномысске и Ставропольском крае.',
  path: '/portfolio',
});

export default async function PortfolioPage() {
  const [rawItems, contentMap] = await Promise.all([
    getPublicPortfolioItems().catch(() => localItems as any[]),
    getPageContentMap('portfolio'),
  ]);

  const items = rawItems.map(normalizeItem);
  const featuredItem = items.find((item) => item.featured);
  const showcaseItems = items.slice(0, 3);

  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Портфолио');
  const heroDescription = getPageContentValue(
    contentMap,
    'hero',
    'description',
    'Примеры реализованных проектов по печати, вывескам и рекламным конструкциям.'
  );

  const uniqueCategoriesCount = new Set(items.map((item) => item.category)).size;
  const heroContextChips = [
    `Кейсы по ${uniqueCategoriesCount || 1} направлениям`,
    `${items.length} опубликованных работ в открытом доступе`,
    featuredItem ? 'Вверху страницы — выделенный кейс из админки' : 'Показываем свежие опубликованные кейсы без ручной витрины',
  ];

  return (
    <div className="pb-8 md:pb-12">
      <Section spacing="compact">
        <PageHero
          className="border-neutral-200/85 bg-gradient-to-br from-white via-neutral-50/70 to-red-50/[0.2] p-4 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.45)] dark:border-neutral-800/90 dark:from-neutral-900 dark:via-neutral-900 dark:to-[#241717] dark:shadow-none sm:p-5 md:p-7 lg:p-9"
          contentClassName="flex h-full flex-col justify-between gap-5 md:gap-6"
          mediaClassName="h-full"
          media={
            featuredItem ? (
              <HeroMediaPanel className="group flex h-full flex-col overflow-hidden border-neutral-200/85 bg-neutral-100/90 p-2 dark:border-neutral-800/90 dark:bg-neutral-900/90 md:p-3">
                <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-2xl sm:min-h-[250px] md:min-h-[300px]">
                  <ProtectedImage
                    src={featuredItem.image}
                    alt={featuredItem.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 space-y-2 md:inset-x-5 md:bottom-5">
                    <span className="inline-flex items-center rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-white/95 backdrop-blur-sm">
                      Выделенный кейс
                    </span>
                    <h2 className="text-xl font-semibold leading-tight text-white md:text-2xl">{featuredItem.title}</h2>
                    <p className="line-clamp-2 max-w-[42ch] text-sm leading-6 text-white/85">
                      {featuredItem.shortDescription || 'Проект опубликован в портфолио и доступен для просмотра в каталоге ниже.'}
                    </p>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/70">{featuredItem.category}</p>
                  </div>
                </div>
              </HeroMediaPanel>
            ) : (
              <HeroMediaPanel className="h-full border-neutral-200/85 bg-neutral-100/85 p-2.5 dark:border-neutral-800/90 dark:bg-neutral-900/85 sm:p-3 md:p-4">
                <div className="grid h-full min-h-[220px] grid-cols-2 gap-2.5 sm:min-h-[260px] sm:gap-3 md:min-h-[300px]">
                  {showcaseItems.length > 0 ? (
                    showcaseItems.map((item, index) => (
                      <article
                        key={item.id}
                        className={`relative overflow-hidden rounded-xl border border-neutral-200/75 bg-white dark:border-neutral-800/80 dark:bg-neutral-900 ${index === 0 ? 'col-span-2' : ''}`}
                      >
                        <ProtectedImage
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 28vw"
                          className="h-full w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <div className="absolute inset-x-3 bottom-3">
                          <p className="line-clamp-1 text-sm font-semibold text-white">{item.title}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="col-span-2 flex items-center justify-center rounded-xl border border-dashed border-neutral-300/80 bg-white/60 p-5 text-center text-sm leading-6 text-neutral-500 dark:border-neutral-700/80 dark:bg-neutral-900/70 dark:text-neutral-400">
                      После публикации работ в админке здесь появится превью портфолио.
                    </div>
                  )}
                </div>
              </HeroMediaPanel>
            )
          }
        >
          <div className="space-y-4">
            <HeroEyebrow>Портфолио реализованных проектов</HeroEyebrow>
            <HeroTitle className="max-w-3xl text-[2rem] leading-[1.07] md:text-[3rem]">{heroTitle}</HeroTitle>
            <HeroLead className="max-w-[41rem] text-sm leading-6 md:text-base md:leading-7">{heroDescription}</HeroLead>
          </div>

          <div className="space-y-3 border-t border-neutral-200/85 pt-4 dark:border-neutral-800/80 md:pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Портфолио как рабочая витрина</p>
            <HeroChipList className="max-w-[38rem] gap-2 sm:grid-cols-1">
              {heroContextChips.map((chip) => (
                <HeroChip key={chip} className="chip-elevated min-h-10 justify-start rounded-xl border-neutral-200/85 bg-white/80 px-3 py-2 text-[12px] font-medium text-neutral-700 shadow-none dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-neutral-200 sm:px-3.5">
                  <span className="card-dot" aria-hidden="true" />
                  {chip}
                </HeroChip>
              ))}
            </HeroChipList>
          </div>
        </PageHero>
      </Section>

      {featuredItem ? (
        <Section spacing="tight">
          <article className="card-visual overflow-hidden border-neutral-200/85 bg-white/90 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.45)] dark:border-neutral-800/90 dark:bg-neutral-900/90 dark:shadow-none">
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
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-[1.9rem]">{featuredItem.title}</h2>
                  <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
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

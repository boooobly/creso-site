import PortfolioGrid from '@/components/PortfolioGrid';
import localItems from '@/data/portfolio.json';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getPublicPortfolioItems } from '@/lib/public-portfolio';

export default async function PortfolioPage() {
  const [items, contentMap] = await Promise.all([
    getPublicPortfolioItems().catch(() => localItems as any[]),
    getPageContentMap('portfolio'),
  ]);

  const heroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Портфолио');
  const heroDescription = getPageContentValue(
    contentMap,
    'hero',
    'description',
    'Примеры реализованных проектов по печати, вывескам и рекламным конструкциям.'
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{heroTitle}</h1>
        <p className="text-neutral-700 dark:text-neutral-300">{heroDescription}</p>
      </div>
      <PortfolioGrid items={items} />
    </div>
  );
}

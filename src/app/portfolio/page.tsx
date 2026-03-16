import PortfolioGrid from '@/components/PortfolioGrid';
import localItems from '@/data/portfolio.json';
import { getPublicPortfolioItems } from '@/lib/public-portfolio';

export default async function PortfolioPage() {
  const items = await getPublicPortfolioItems().catch(() => localItems as any[]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Портфолио</h1>
      <PortfolioGrid items={items} />
    </div>
  );
}

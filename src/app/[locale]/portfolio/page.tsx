import PortfolioGrid from '@/components/PortfolioGrid';
import localItems from '@/data/portfolio.json';
import { getPortfolio } from '@/lib/contentful';

export default async function PortfolioPage() {
  const cms = await getPortfolio().catch(() => null);
  const items = (cms ?? (localItems as any[]));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Портфолио</h1>
      <PortfolioGrid items={items} />
    </div>
  );
}

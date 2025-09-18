import PortfolioGrid from '@/components/PortfolioGrid';
import items from '@/data/portfolio.json';

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Портфолио</h1>
      <PortfolioGrid items={items} />
    </div>
  );
}
import type { PortfolioItem } from '@/types';
import ProtectedImage from '@/components/ui/ProtectedImage';

export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {items.map((p) => (
        <figure key={p.id} className="card-visual card-interactive select-none">
          <ProtectedImage src={p.image} alt={p.title} width={800} height={600} className="w-full h-48 object-cover" />
          <figcaption className="p-4 text-sm">{p.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}

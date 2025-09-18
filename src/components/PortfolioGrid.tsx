import Image from 'next/image';
import type { PortfolioItem } from '@/types';

export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {items.map((p) => (
        <figure key={p.id} className="card overflow-hidden">
          <Image src={p.image} alt={p.title} width={800} height={600} className="w-full h-48 object-cover" />
          <figcaption className="p-3 text-sm">{p.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}
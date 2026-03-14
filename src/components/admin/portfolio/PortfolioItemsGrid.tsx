'use client';

import { useRouter } from 'next/navigation';
import PortfolioItemCard from './PortfolioItemCard';

type PortfolioListItem = {
  id: string;
  title: string;
  category: string;
  shortDescription: string | null;
  coverImage: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

type PortfolioItemsGridProps = {
  items: PortfolioListItem[];
  onTogglePublish: (id: string, nextPublished: boolean) => Promise<void>;
  onToggleFeatured: (id: string, nextFeatured: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function PortfolioItemsGrid({
  items,
  onTogglePublish,
  onToggleFeatured,
  onDelete
}: PortfolioItemsGridProps) {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <PortfolioItemCard
          key={item.id}
          item={item}
          onTogglePublish={async (id, nextPublished) => {
            await onTogglePublish(id, nextPublished);
            router.refresh();
          }}
          onToggleFeatured={async (id, nextFeatured) => {
            await onToggleFeatured(id, nextFeatured);
            router.refresh();
          }}
          onDelete={async (id) => {
            await onDelete(id);
            router.refresh();
          }}
        />
      ))}
    </div>
  );
}

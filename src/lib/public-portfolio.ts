import { prisma } from '@/lib/db/prisma';

export type PublicPortfolioItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  image: string;
  sortOrder: number;
};

const PORTFOLIO_PLACEHOLDER_IMAGE = '/og-image.png';

function resolvePortfolioImage(item: {
  coverImage: string | null;
  coverImageAsset: { url: string } | null;
}) {
  return item.coverImageAsset?.url ?? item.coverImage ?? PORTFOLIO_PLACEHOLDER_IMAGE;
}

function mapPublicPortfolioItem(item: {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string | null;
  sortOrder: number;
  coverImage: string | null;
  coverImageAsset: { url: string } | null;
}): PublicPortfolioItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    shortDescription: item.shortDescription ?? '',
    image: resolvePortfolioImage(item),
    sortOrder: item.sortOrder
  };
}

export async function getPublicPortfolioItems() {
  const items = await prisma.portfolioItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      coverImageAsset: {
        select: {
          url: true
        }
      }
    }
  });

  return items.map(mapPublicPortfolioItem);
}

export async function getFeaturedPortfolioItems(limit = 3) {
  const items = await prisma.portfolioItem.findMany({
    where: { published: true, featured: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
    include: {
      coverImageAsset: {
        select: {
          url: true
        }
      }
    }
  });

  return items.map(mapPublicPortfolioItem);
}

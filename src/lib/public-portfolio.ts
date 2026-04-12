import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export type PublicPortfolioItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  image: string;
  featured: boolean;
  sortOrder: number;
  galleryImages: string[];
};

const PORTFOLIO_PLACEHOLDER_IMAGE = '/og-image.png';
const UNCATEGORIZED_LABEL = 'Без категории';

function resolvePortfolioImage(item: {
  coverImage: string | null;
  coverImageAsset: { url: string } | null;
}) {
  return item.coverImageAsset?.url ?? item.coverImage ?? PORTFOLIO_PLACEHOLDER_IMAGE;
}

function normalizeCategory(category: string | null) {
  const normalized = String(category ?? '').trim();
  return normalized || UNCATEGORIZED_LABEL;
}

function parseGalleryImages(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry.trim();
      }

      if (!entry || typeof entry !== 'object') {
        return '';
      }

      return String((entry as { url?: unknown }).url ?? '').trim();
    })
    .filter((entry) => Boolean(entry));
}

function mapPublicPortfolioItem(item: {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  shortDescription: string | null;
  featured: boolean;
  sortOrder: number;
  coverImage: string | null;
  galleryImages: Prisma.JsonValue;
  coverImageAsset: { url: string } | null;
}): PublicPortfolioItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: normalizeCategory(item.category),
    shortDescription: item.shortDescription ?? '',
    image: resolvePortfolioImage(item),
    featured: item.featured,
    sortOrder: item.sortOrder,
    galleryImages: parseGalleryImages(item.galleryImages),
  };
}

export async function getPublicPortfolioItems() {
  const items = await prisma.portfolioItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      coverImageAsset: {
        select: {
          url: true,
        },
      },
    },
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
          url: true,
        },
      },
    },
  });

  return items.map(mapPublicPortfolioItem);
}

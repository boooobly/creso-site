import type { PageContent, PortfolioItem, PricingEntry, SiteSetting } from '@prisma/client';

export type AdminPaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type PortfolioItemInput = Omit<
  PortfolioItem,
  'id' | 'createdAt' | 'updatedAt' | 'galleryImages'
> & { galleryImages: string[] };

export type SiteSettingInput = Omit<SiteSetting, 'id' | 'createdAt' | 'updatedAt'>;

export type PageContentInput = Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>;

export type PricingEntryInput = Omit<PricingEntry, 'id' | 'createdAt' | 'updatedAt'>;

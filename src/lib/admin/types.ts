import type {
  PageContent,
  PortfolioItem,
  PriceCategory,
  PriceItem,
  PricingEntry,
  SiteSetting,
  MediaAsset
} from '@prisma/client';

export type AdminPaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type PortfolioItemInput = Omit<
  PortfolioItem,
  'id' | 'createdAt' | 'updatedAt' | 'galleryImages'
> & { galleryImages: Array<{ url: string; assetId?: string }> };

export type SiteSettingInput = Omit<SiteSetting, 'id' | 'createdAt' | 'updatedAt'>;

export type PageContentInput = Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>;

export type PricingEntryInput = Omit<PricingEntry, 'id' | 'createdAt' | 'updatedAt'>;

export type PriceCategoryInput = Omit<PriceCategory, 'id' | 'createdAt' | 'updatedAt'>;

export type PriceItemInput = Omit<PriceItem, 'id' | 'createdAt' | 'updatedAt'>;

export type MediaAssetInput = Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>;

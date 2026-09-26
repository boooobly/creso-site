export type Service = {
  id: string;
  title: string;
  description: string;
  slug: string;
};

export type PortfolioItem = {
  id: string;
  slug: string;
  title: string;
  image: string;
  imageAlt?: string;
  category: string;
  shortDescription: string;
  featured?: boolean;
  sortOrder?: number;
  galleryImages?: Array<{ url: string; alt?: string }>;
};

export type FaqItem = { q: string; a: string };

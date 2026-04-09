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
  category: string;
  shortDescription: string;
  featured?: boolean;
  sortOrder?: number;
  galleryImages?: string[];
};

export type FaqItem = { q: string; a: string };

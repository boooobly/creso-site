export type Service = {
  id: string;
  title: string;
  description: string;
  slug: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  image: string;
  category: string;
};

export type FaqItem = { q: string; a: string };
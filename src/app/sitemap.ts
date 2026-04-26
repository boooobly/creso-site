import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/url/getBaseUrl';

type PublicSitemapRoute = {
  route: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

const PUBLIC_ROUTES: PublicSitemapRoute[] = [
  { route: '', changeFrequency: 'weekly', priority: 1 },
  { route: '/services', changeFrequency: 'weekly', priority: 0.95 },
  { route: '/baget', changeFrequency: 'weekly', priority: 0.9 },
  { route: '/wide-format-printing', changeFrequency: 'weekly', priority: 0.9 },
  { route: '/milling', changeFrequency: 'weekly', priority: 0.9 },
  { route: '/plotter-cutting', changeFrequency: 'weekly', priority: 0.9 },
  { route: '/heat-transfer', changeFrequency: 'weekly', priority: 0.9 },
  { route: '/services/mugs', changeFrequency: 'weekly', priority: 0.88 },
  { route: '/services/stands', changeFrequency: 'weekly', priority: 0.88 },
  { route: '/outdoor-advertising', changeFrequency: 'weekly', priority: 0.92 },
  { route: '/print', changeFrequency: 'weekly', priority: 0.88 },
  { route: '/production', changeFrequency: 'monthly', priority: 0.8 },
  { route: '/portfolio', changeFrequency: 'weekly', priority: 0.85 },
  { route: '/reviews', changeFrequency: 'weekly', priority: 0.75 },
  { route: '/contacts', changeFrequency: 'monthly', priority: 0.8 },
  { route: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();

  return PUBLIC_ROUTES.map(({ route, changeFrequency, priority }) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/url/getBaseUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const routes = ['', '/baget', '/services', '/production', '/portfolio', '/reviews', '/contacts', '/privacy', '/milling', '/plotter-cutting', '/wide-format-printing', '/print', '/heat-transfer', '/services/mugs', '/services/stands'];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}

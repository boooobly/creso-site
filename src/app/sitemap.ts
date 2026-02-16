import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://example.com';
  const routes = ['', '/baget', '/services', '/production', '/portfolio', '/reviews', '/contacts', '/privacy', '/milling', '/plotter-cutting', '/wide-format-printing', '/print', '/heat-transfer'];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}

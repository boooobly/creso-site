import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://example.com';
  const routes = ['', '/baget', '/services', '/production', '/portfolio', '/blog', '/contacts', '/privacy', '/plotter-cutting', '/wide-format-printing'];
  return routes.map((r) => ({ url: `${base}${r}`, lastModified: new Date() }));
}

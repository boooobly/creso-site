import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://example.com';
  const routes = ['', '/baget', '/services', '/production', '/portfolio', '/blog', '/contacts', '/privacy'];
  return routes.flatMap((r) => (
    [
      { url: `${base}/ru${r}`, lastModified: new Date() },
      { url: `${base}/en${r}`, lastModified: new Date() }
    ]
  ));
}
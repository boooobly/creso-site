import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/url/getBaseUrl';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api', '/api/', '/pay/mock', '/order/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

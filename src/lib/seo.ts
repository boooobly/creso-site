import type { Metadata } from 'next';
import { getPublicSiteSettings } from '@/lib/site-settings';
import { getBaseUrl } from '@/lib/url/getBaseUrl';

export async function getDefaultMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();

  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      siteName: settings.seoSiteName,
      images: [settings.seoOgImage],
      type: 'website',
    },
    metadataBase: new URL(getBaseUrl()),
  };
}

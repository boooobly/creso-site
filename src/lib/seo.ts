import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { getBaseUrl } from '@/lib/url/getBaseUrl';

const DEFAULT_OG_IMAGE = '/og-image.png';
const DEFAULT_LOCALE = 'ru_RU';

function toAbsoluteUrl(path: string): string {
  const base = getBaseUrl();
  return new URL(path, `${base}/`).toString();
}

export type PublicPageSeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildPublicPageMetadata({ title, description, path, image = DEFAULT_OG_IMAGE }: PublicPageSeoInput): Metadata {
  const canonicalUrl = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale: DEFAULT_LOCALE,
      siteName: BRAND.name,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    metadataBase: new URL(getBaseUrl()),
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildServiceJsonLd(name: string, description: string, path: string) {
  const serviceUrl = toAbsoluteUrl(path);

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    areaServed: BRAND.city,
    provider: {
      '@type': 'Organization',
      name: BRAND.name,
      url: getBaseUrl(),
    },
    serviceType: name,
    url: serviceUrl,
  };
}

export function buildOrganizationJsonLd() {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    url: baseUrl,
    logo: toAbsoluteUrl('/og-image.png'),
    email: BRAND.email,
    telephone: BRAND.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND.city,
      streetAddress: BRAND.address,
      addressCountry: 'RU',
    },
  };
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BRAND.name,
    image: toAbsoluteUrl('/og-image.png'),
    telephone: BRAND.phone,
    email: BRAND.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BRAND.address,
      addressLocality: BRAND.city,
      addressCountry: 'RU',
    },
    areaServed: 'Ставропольский край',
    url: getBaseUrl(),
  };
}

export function buildWebSiteJsonLd() {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND.name,
    url: baseUrl,
    inLanguage: 'ru-RU',
  };
}

export async function getDefaultMetadata(): Promise<Metadata> {
  const { getPublicSiteSettings } = await import('@/lib/site-settings');
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
      locale: DEFAULT_LOCALE,
    },
    metadataBase: new URL(getBaseUrl()),
  };
}

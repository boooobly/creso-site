import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';
import { getBaseUrl } from '@/lib/url/getBaseUrl';

const DEFAULT_OG_IMAGE = '/og-image.png';
const DEFAULT_LOCALE = 'ru_RU';
const DEFAULT_TWITTER_CARD: Metadata['twitter']['card'] = 'summary_large_image';

function toAbsoluteUrl(path: string): string {
  const base = getBaseUrl();
  return new URL(path, `${base}/`).toString();
}

function getVerificationMetadata(): Metadata['verification'] | undefined {
  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  const yandex = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION?.trim();

  if (!google && !yandex) {
    return undefined;
  }

  return {
    google,
    yandex,
  };
}

export type PublicPageSeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildPublicPageMetadata({ title, description, path, image = DEFAULT_OG_IMAGE }: PublicPageSeoInput): Metadata {
  const baseUrl = getBaseUrl();
  const canonicalUrl = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image);

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: getVerificationMetadata(),
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
    twitter: {
      card: DEFAULT_TWITTER_CARD,
      title,
      description,
      images: [imageUrl],
    },
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
      addressLocality: 'Невинномысск',
      streetAddress: BRAND.address,
      addressCountry: 'RU',
    },
    areaServed: 'Ставропольский край',
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
    priceRange: '₽₽',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:30',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: BRAND.address,
      addressLocality: 'Невинномысск',
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
  const baseUrl = getBaseUrl();
  const canonicalUrl = toAbsoluteUrl('/');
  const ogImageUrl = toAbsoluteUrl(settings.seoOgImage || DEFAULT_OG_IMAGE);

  return {
    metadataBase: new URL(baseUrl),
    title: settings.seoTitle,
    description: settings.seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: getVerificationMetadata(),
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      siteName: settings.seoSiteName,
      images: [ogImageUrl],
      type: 'website',
      locale: DEFAULT_LOCALE,
      url: canonicalUrl,
    },
    twitter: {
      card: DEFAULT_TWITTER_CARD,
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [ogImageUrl],
    },
  };
}

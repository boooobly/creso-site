import type { Metadata } from 'next';
import MillingPageClient from '@/components/milling/MillingPageClient';
import JsonLd from '@/components/seo/JsonLd';
import { getMillingPricingPublicData } from '@/lib/milling/millingPricing';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Фрезеровка ПВХ, акрила и композита в Невинномысске | CredoMir',
  description: 'ЧПУ-фрезеровка ПВХ, акрила, композита и других листовых материалов в Невинномысске: точный рез и чистая кромка.',
  path: '/milling',
});

export default async function MillingPage() {
  const pricingData = await getMillingPricingPublicData();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Главная', path: '/' },
          { name: 'Услуги', path: '/services' },
          { name: 'Фрезеровка', path: '/milling' },
        ])}
      />
      <JsonLd
        data={buildServiceJsonLd(
          'Фрезеровка ПВХ, акрила и композита в Невинномысске',
          'ЧПУ-фрезеровка ПВХ, акрила, композита и других листовых материалов с точной геометрией.',
          '/milling'
        )}
      />
      <MillingPageClient {...pricingData} />
    </>
  );
}

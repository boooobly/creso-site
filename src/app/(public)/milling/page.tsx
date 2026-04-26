import type { Metadata } from 'next';
import MillingPageClient from '@/components/milling/MillingPageClient';
import JsonLd from '@/components/seo/JsonLd';
import { getMillingPricingPublicData } from '@/lib/milling/millingPricing';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Фрезеровка листовых материалов в Невинномысске | CredoMir',
  description: 'Фрезеровка ПВХ, акрила, композита и других листовых материалов на ЧПУ. Точные размеры, чистая кромка и расчёт сроков.',
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
          'Фрезеровка листовых материалов',
          'Фрезеровка ПВХ, акрила, композита и других листовых материалов на ЧПУ с точной геометрией.',
          '/milling'
        )}
      />
      <MillingPageClient {...pricingData} />
    </>
  );
}

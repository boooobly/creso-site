import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import TshirtsLanding from '@/components/heat-transfer/TshirtsLanding';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';
import { getSiteImages } from '@/lib/site-images';
import { TSHIRTS_SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Печать на футболках в Невинномысске | CredoMir',
  description: 'Термоперенос и печать на футболках в Невинномысске: брендирование для команд, промо и корпоративных заказов.',
  path: '/heat-transfer',
});

export default async function HeatTransferPage() {
  const [contentMap, galleryImages] = await Promise.all([
    getPageContentMap('heat_transfer'),
    getSiteImages(TSHIRTS_SITE_IMAGE_SLOTS.map((slot) => slot.key)),
  ]);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Главная', path: '/' },
          { name: 'Услуги', path: '/services' },
          { name: 'Печать на футболках', path: '/heat-transfer' },
        ])}
      />
      <JsonLd
        data={buildServiceJsonLd(
          'Печать на футболках в Невинномысске',
          'Термоперенос на футболки и текстиль для брендов, команд и мероприятий.',
          '/heat-transfer'
        )}
      />
      <TshirtsLanding
        heroTitle={getPageContentValue(contentMap, 'hero', 'title', 'Печать на футболках')}
        heroDescription={getPageContentValue(
          contentMap,
          'hero',
          'description',
          'Печать на футболках для команд, брендов и мероприятий. Подбираем технологию под задачу и выдаём изделие, готовое к использованию.'
        )}
        heroPrimaryButtonText={getPageContentValue(contentMap, 'hero', 'primaryButtonText', 'Оставить заявку')}
        heroSecondaryButtonText={getPageContentValue(contentMap, 'hero', 'secondaryButtonText', 'Смотреть примеры')}
        galleryImages={galleryImages}
      />
    </>
  );
}

import TshirtsLanding from '@/components/heat-transfer/TshirtsLanding';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getSiteImages } from '@/lib/site-images';
import { TSHIRTS_SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';

export default async function HeatTransferPage() {
  const [contentMap, galleryImages] = await Promise.all([
    getPageContentMap('heat_transfer'),
    getSiteImages(TSHIRTS_SITE_IMAGE_SLOTS.map((slot) => slot.key)),
  ]);

  return (
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
  );
}

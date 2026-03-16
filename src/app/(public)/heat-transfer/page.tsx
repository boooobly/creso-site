import TshirtsLanding from '@/components/heat-transfer/TshirtsLanding';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';

export default async function HeatTransferPage() {
  const contentMap = await getPageContentMap('heat_transfer');

  return (
    <TshirtsLanding
      heroTitle={getPageContentValue(contentMap, 'hero', 'title', 'Печать на футболках')}
      heroDescription={getPageContentValue(
        contentMap,
        'hero',
        'description',
        'Полноцвет A4 — 250 ₽ за 1 сторону. Работаем на ваших или наших футболках.'
      )}
      heroPrimaryButtonText={getPageContentValue(contentMap, 'hero', 'primaryButtonText', 'Оставить заявку')}
      heroSecondaryButtonText={getPageContentValue(contentMap, 'hero', 'secondaryButtonText', 'Смотреть примеры')}
    />
  );
}

import MillingPageClient from '@/components/milling/MillingPageClient';
import { getMillingPricingPublicData } from '@/lib/milling/millingPricing';

export default async function MillingPage() {
  const pricingData = await getMillingPricingPublicData();

  return <MillingPageClient {...pricingData} />;
}

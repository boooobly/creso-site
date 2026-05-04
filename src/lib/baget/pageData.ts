import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/logger';
import type { BaguetteExtrasPricingConfig } from '@/lib/baget/baguetteExtrasPricing';
import { getBaguetteExtrasPricingConfig } from '@/lib/baget/baguetteExtrasPricing';
import { getPageContentMap } from '@/lib/page-content';

const BAGET_CONTENT_CACHE_SECONDS = 45;
const BAGET_PRICING_CACHE_SECONDS = 30;

async function loadBagetPageContentEntriesUncached() {
  const map = await getPageContentMap('baget');
  return Array.from(map.entries());
}

export async function getCachedBagetPageContentMap() {
  const load = unstable_cache(
    async () => loadBagetPageContentEntriesUncached(),
    ['baget.page_content.entries'],
    { revalidate: BAGET_CONTENT_CACHE_SECONDS }
  );

  try {
    const entries = await load();
    return new Map<string, string>(entries);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('incrementalCache missing')) {
      return getPageContentMap('baget');
    }

    logger.warn('baget.page_content.cached_read_failed', { error: message });
    return getPageContentMap('baget');
  }
}

async function loadBagetPricingConfigUncached() {
  const pricing = await getBaguetteExtrasPricingConfig();
  return pricing.config;
}

export async function getCachedBaguetteExtrasPricingConfig(): Promise<BaguetteExtrasPricingConfig> {
  const load = unstable_cache(
    async () => loadBagetPricingConfigUncached(),
    ['baget.page_pricing.config.v2'],
    { revalidate: BAGET_PRICING_CACHE_SECONDS }
  );

  try {
    return await load();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('incrementalCache missing')) {
      const pricing = await getBaguetteExtrasPricingConfig();
      return pricing.config;
    }

    logger.warn('baget.page_pricing.cached_read_failed', { error: message });
    const pricing = await getBaguetteExtrasPricingConfig();
    return pricing.config;
  }
}

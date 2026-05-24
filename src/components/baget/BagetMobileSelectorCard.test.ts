import { describe, expect, it } from 'vitest';
import { BAGET_CARD_IMAGE_WIDTH, getBagetProxyImageSrc } from './BagetCard';
import { getMobileBagetImageCandidates, getNextMobileBagetImageIndex } from './BagetMobileSelectorCard';

describe('BagetMobileSelectorCard image helpers', () => {
  it('builds proxy src for mobile card image candidates', () => {
    const candidates = getMobileBagetImageCandidates({
      cardImage: 'https://example.com/baget-corner.webp',
      fallbackImage: 'https://example.com/baget-plank.webp',
    });

    const src = getBagetProxyImageSrc(candidates[0], BAGET_CARD_IMAGE_WIDTH);

    expect(src).toContain('/api/baget/image-proxy');
    expect(src).toContain('width=480');
  });

  it('falls back through candidates and does not overflow index', () => {
    expect(getNextMobileBagetImageIndex(0, 3)).toBe(1);
    expect(getNextMobileBagetImageIndex(1, 3)).toBe(2);
    expect(getNextMobileBagetImageIndex(2, 3)).toBe(2);
  });
});

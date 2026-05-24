import { describe, expect, it } from 'vitest';
import { BAGET_CARD_IMAGE_WIDTH, BAGET_PREVIEW_IMAGE_WIDTH, getBagetProxyImageSrc } from './BagetCard';

describe('baget image source helper', () => {
  it('returns the baguette image proxy URL with a width for remote images', () => {
    const remoteImage = 'https://drive.google.com/uc?id=baguette-image';

    expect(getBagetProxyImageSrc(remoteImage, 700)).toBe(
      `/api/baget/image-proxy?url=${encodeURIComponent(remoteImage)}&width=700`,
    );
  });

  it('returns local image paths directly', () => {
    expect(getBagetProxyImageSrc('/images/baget/local.png', 700)).toBe('/images/baget/local.png');
  });

  it('uses expected image width constants for card and preview requests', () => {
    expect(BAGET_CARD_IMAGE_WIDTH).toBe(480);
    expect(BAGET_PREVIEW_IMAGE_WIDTH).toBe(1600);
  });
});

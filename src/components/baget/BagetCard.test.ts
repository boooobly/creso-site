import { describe, expect, it } from 'vitest';
import { getBagetProxyImageSrc } from './BagetCard';

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
});

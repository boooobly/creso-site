import { describe, expect, it } from 'vitest';
import { getModalImageSrc, getNextImageOptimizerSrc, getProxyImageSrc } from './BagetCard';

describe('baget modal image sources', () => {
  const remoteImage = 'https://drive.google.com/uc?id=baguette-image';
  const thumbnailCurrentSrc = '/_next/image?url=https%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3Dbaguette-image&w=640&q=75';

  it('uses the already loaded thumbnail currentSrc first when available', () => {
    expect(getModalImageSrc(remoteImage, 'thumbnail', thumbnailCurrentSrc)).toBe(thumbnailCurrentSrc);
  });

  it('returns a Next Image optimizer URL for remote images in nextImage mode', () => {
    expect(getModalImageSrc(remoteImage, 'nextImage', thumbnailCurrentSrc)).toBe(
      `/_next/image?url=${encodeURIComponent(remoteImage)}&w=1200&q=90`,
    );
    expect(getNextImageOptimizerSrc(remoteImage)).toBe(`/_next/image?url=${encodeURIComponent(remoteImage)}&w=1200&q=90`);
  });

  it('returns the image proxy URL for remote images in proxy mode', () => {
    expect(getModalImageSrc(remoteImage, 'proxy', thumbnailCurrentSrc)).toBe(`/api/baget/image-proxy?url=${encodeURIComponent(remoteImage)}`);
    expect(getProxyImageSrc(remoteImage)).toBe(`/api/baget/image-proxy?url=${encodeURIComponent(remoteImage)}`);
  });

  it('returns local paths directly for optimizer and proxy fallbacks', () => {
    const localImage = '/images/baget/local.png';

    expect(getModalImageSrc(localImage, 'nextImage', null)).toBe(localImage);
    expect(getModalImageSrc(localImage, 'proxy', null)).toBe(localImage);
    expect(getNextImageOptimizerSrc(localImage)).toBe(localImage);
    expect(getProxyImageSrc(localImage)).toBe(localImage);
  });
});

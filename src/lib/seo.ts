import type { Metadata } from 'next';
import { BRAND } from './constants';

export const defaultMetadata: Metadata = {
  title: `${BRAND.name} — рекламно-производственная компания`,
  description:
    'Багетное оформление, фрезеровка, широкоформатная печать, наружная реклама в Невинномысске.',
  openGraph: {
    title: `${BRAND.name} — рекламно-производственная компания`,
    description:
      'Багет, фрезеровка, широкоформатная печать, наружная реклама. Невинномысск.',
    images: ['/og-image.png'],
    type: 'website',
  },
  metadataBase: new URL('https://example.com'),
};
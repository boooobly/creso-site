import type { Metadata } from 'next';
import Home from '../page';
import { buildPublicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'CredoMir - наружная реклама и печать в Невинномысске',
  description: 'CredoMir в Невинномысске - вывески, наружная реклама, широкоформатная печать, багет, стенды, фрезеровка и монтаж под ключ.',
  path: '/ru',
});

export default Home;

import type { Metadata } from 'next';
import PlotterCuttingPage from '@/components/plotter/PlotterCuttingPage';
import JsonLd from '@/components/seo/JsonLd';
import { PLOTTER_SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';
import { getSiteImages } from '@/lib/site-images';
import { buildBreadcrumbJsonLd, buildPublicPageMetadata, buildServiceJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Плоттерная резка в Невинномысске | CredoMir',
  description: 'Плоттерная и контурная резка плёнки и стикеров в Невинномысске: подготовка макета, выборка и аккуратная выдача под монтаж.',
  path: '/plotter-cutting',
});

export default async function PlotterCuttingRoute() {
  const siteImages = await getSiteImages(PLOTTER_SITE_IMAGE_SLOTS.map((slot) => slot.key));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Главная', path: '/' },
          { name: 'Услуги', path: '/services' },
          { name: 'Плоттерная резка', path: '/plotter-cutting' },
        ])}
      />
      <JsonLd
        data={buildServiceJsonLd(
          'Плоттерная резка в Невинномысске',
          'Контурная резка плёнки, наклеек и аппликаций для витрин, табличек и брендирования.',
          '/plotter-cutting'
        )}
      />
      <PlotterCuttingPage siteImages={siteImages} />
    </>
  );
}

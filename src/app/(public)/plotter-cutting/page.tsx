import PlotterCuttingPage from '@/components/plotter/PlotterCuttingPage';
import { PLOTTER_SITE_IMAGE_SLOTS } from '@/lib/site-image-slots';
import { getSiteImages } from '@/lib/site-images';

export default async function PlotterCuttingRoute() {
  const siteImages = await getSiteImages(PLOTTER_SITE_IMAGE_SLOTS.map((slot) => slot.key));

  return <PlotterCuttingPage siteImages={siteImages} />;
}

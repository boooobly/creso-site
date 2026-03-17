import { getServices } from '@/lib/contentful';
import servicesLocal from '@/data/services.json';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import { getSiteImages } from '@/lib/site-images';
import { SERVICE_CARD_IMAGE_SLOT_BY_ID } from '@/lib/site-service-image-slots';

const serviceImageById: Record<string, string> = {
  baget: '/images/services/bagget.png',
  cnc: '/images/services/milling.png',
  print: '/images/services/printing.png',
  plotter: '/images/services/plotter.png',
  thermo: '/images/services/t-shirt.png',
  mugs: '/images/services/glasses.png',
  stands: '/images/services/stends.png',
  outdoor: '/images/services/outdoor.png',
  polygraphy: '/images/services/cards.png',
};

export default async function ServicesPage() {
  const [sCMS, serviceCardImages] = await Promise.all([
    getServices().catch(() => null),
    getSiteImages(Object.values(SERVICE_CARD_IMAGE_SLOT_BY_ID)),
  ]);
  const services = sCMS ?? (servicesLocal as any[]);

  const resolveServiceHref = (service: any) => {
    const isPrintService = service?.id === 'polygraphy' || service?.title === 'Визитки и флаеры';
    if (isPrintService) return '/print';
    const isMillingService = service?.id === 'cnc' || service?.title === 'Фрезеровка листовых материалов';
    if (isMillingService) return '/milling';
    const isWideFormatService = service?.id === 'print' || service?.title === 'Широкоформатная печать';
    if (isWideFormatService) return '/wide-format-printing';
    const isPlotterService = service?.id === 'plotter' || service?.title === 'Плоттерная резка';
    if (isPlotterService) return '/plotter-cutting';
    const isHeatTransferService =
      service?.id === 'thermo' || service?.title === 'Печать на футболках' || service?.title === 'Термоперенос на футболки и кружки';
    if (isHeatTransferService) return '/heat-transfer';
    const isMugsService = service?.id === 'mugs' || service?.title === 'Печать на кружках';
    if (isMugsService) return '/services/mugs';
    const isStandsService = service?.id === 'stands' || service?.title === 'Изготовление стендов';
    if (isStandsService) return '/services/stands';
    const isOutdoorService = service?.id === 'outdoor' || service?.title === 'Наружная реклама';
    if (isOutdoorService) return '/outdoor-advertising';
    return `/${service.slug}`;
  };

  return (
    <>
      <Section className="pt-6 pb-6 md:pt-8 md:pb-7">
        <div className="space-y-2">
          <p className="t-eyebrow">УСЛУГИ</p>
          <h1 className="t-h2">Список услуг</h1>
          <p className="t-body text-muted-foreground max-w-3xl">
            Выполняем проекты по наружной рекламе, печати и производству под ключ: от расчёта и дизайна до монтажа и сдачи.
          </p>
        </div>
      </Section>

      <Section background="muted" fullBleed className="border-y border-neutral-200/70 py-8 md:py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s: any) => {
            const slotKey = SERVICE_CARD_IMAGE_SLOT_BY_ID[String(s.id)];
            const imageSrc = slotKey ? (serviceCardImages[slotKey]?.url ?? serviceImageById[s.id]) : serviceImageById[s.id];

            return <ServiceCard key={s.id} title={s.title} desc={s.description} href={resolveServiceHref(s)} imageSrc={imageSrc} />;
          })}
        </div>
      </Section>
    </>
  );
}

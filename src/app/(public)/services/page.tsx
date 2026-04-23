import { getServices } from '@/lib/contentful';
import servicesLocal from '@/data/services.json';
import Section from '@/components/Section';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';
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
    <div className="-mt-6 md:-mt-8">
      <Section spacing="compact" background="muted" fullBleed className="border-y border-neutral-200/70">
        <div className="section-header">
          <p className="t-eyebrow">НАПРАВЛЕНИЯ</p>
          <h2 className="t-h2">Выберите нужную услугу</h2>
          <p className="t-body text-muted-foreground max-w-2xl">Каждая карточка ведёт на профильную страницу услуги с подробностями, примерами и формой заявки.</p>
        </div>
        <div className="grid-cards md:grid-cols-2 lg:grid-cols-3">
          {services.map((s: any) => {
            const slotKey = SERVICE_CARD_IMAGE_SLOT_BY_ID[String(s.id)];
            const imageSrc = slotKey ? (serviceCardImages[slotKey]?.url ?? serviceImageById[s.id]) : serviceImageById[s.id];

            return <ServiceCard key={s.id} title={s.title} desc={s.description} href={resolveServiceHref(s)} imageSrc={imageSrc} />;
          })}
        </div>
      </Section>

      <Section spacing="tight">
        <div className="cta-shell dark:border-neutral-700/80 dark:bg-gradient-to-br dark:from-[#141419] dark:via-[#191920] dark:to-[#261717] dark:shadow-[0_22px_44px_-34px_rgba(0,0,0,0.7)]">
          <div className="section-header-split mb-0">
            <div className="space-y-2">
              <p className="t-eyebrow">НЕ ЗНАЕТЕ, С ЧЕГО НАЧАТЬ</p>
              <h2 className="t-h3">Поможем подобрать оптимальный формат под вашу задачу</h2>
              <p className="t-body text-muted-foreground max-w-2xl">Подскажем материалы, технологию производства и сроки, чтобы вы быстро перешли от идеи к готовому результату.</p>
            </div>
            <Link href="/contacts" className="btn-secondary w-full justify-center no-underline sm:w-auto">Связаться с менеджером</Link>
          </div>
        </div>
      </Section>
    </div>
  );
}

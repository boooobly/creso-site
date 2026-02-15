import { getServices } from '@/lib/contentful';
import servicesLocal from '@/data/services.json';
import ServiceCard from '@/components/ServiceCard';

export default async function ServicesPage() {
  const sCMS = await getServices().catch(() => null);
  const services = (sCMS ?? (servicesLocal as any[]));

  const resolveServiceHref = (service: any) => {
    const isPrintService = service?.id === 'polygraphy' || service?.title === 'Визитки и флаеры';
    if (isPrintService) return '/print';
    const isMillingService = service?.id === 'cnc' || service?.title === 'Фрезеровка листовых материалов';
    if (isMillingService) return '/milling';
    const isWideFormatService = service?.id === 'print' || service?.title === 'Широкоформатная печать';
    if (isWideFormatService) return '/wide-format-printing';
    const isPlotterService = service?.id === 'plotter' || service?.title === 'Плоттерная резка';
    if (isPlotterService) return '/plotter-cutting';
    const isHeatTransferService = service?.id === 'thermo' || service?.title === 'Термоперенос на футболки и кружки';
    if (isHeatTransferService) return '/heat-transfer';
    const isOutdoorService = service?.id === 'outdoor' || service?.title === 'Наружная реклама';
    if (isOutdoorService) return '/outdoor-advertising';
    return `/${service.slug}`;
  };

  return (
    <div className="space-y-6 bg-neutral-100 py-16 dark:bg-neutral-950">
      <h1 className="text-2xl font-bold">Список услуг</h1>
      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s: any) => (
            <ServiceCard key={s.id} title={s.title} desc={s.description} href={resolveServiceHref(s)} />
          ))}
        </div>
      </div>
    </div>
  );
}

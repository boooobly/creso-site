import { getServices } from '@/lib/contentful';
import servicesLocal from '@/data/services.json';
import ServiceCard from '@/components/ServiceCard';

export default async function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
  const sCMS = await getServices().catch(() => null);
  const services = (sCMS ?? (servicesLocal as any[]));

  const resolveServiceHref = (service: any) => {
    const isPrintService = service?.id === 'polygraphy' || service?.title === 'Визитки и флаеры';
    if (isPrintService) return `/${locale}/print`;
    const isMillingService = service?.id === 'cnc' || service?.title === 'Фрезеровка листовых материалов';
    if (isMillingService) return `/${locale}/milling`;
    const isWideFormatService = service?.id === 'print' || service?.title === 'Широкоформатная печать';
    if (isWideFormatService) return `/${locale}/wide-format-printing`;
    const isPlotterService = service?.id === 'plotter' || service?.title === 'Плоттерная резка';
    if (isPlotterService) return `/${locale}/plotter-cutting`;
    return `/${locale}/${service.slug}`;
  };

  return (
    <div className="space-y-6 bg-neutral-100 py-16 dark:bg-neutral-950">
      <h1 className="text-2xl font-bold">Список услуг</h1>
      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s: any) => (
            <ServiceCard
              key={s.id}
              title={s.title}
              desc={s.description}
              href={resolveServiceHref(s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

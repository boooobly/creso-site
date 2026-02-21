import { getServices } from '@/lib/contentful';
import servicesLocal from '@/data/services.json';
import ServiceCard from '@/components/ServiceCard';
import OrderMugsForm from '@/components/OrderMugsForm';

type ServiceItem = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
};

export default async function ServicesPage() {
  const sCMS = await getServices().catch(() => null);
  const services = (sCMS ?? servicesLocal) as ServiceItem[];

  const resolveServiceHref = (service: ServiceItem) => {
    const isPrintService = service.id === 'polygraphy' || service.title === 'Визитки и флаеры';
    if (isPrintService) return '/print';
    const isMillingService = service.id === 'cnc' || service.title === 'Фрезеровка листовых материалов';
    if (isMillingService) return '/milling';
    const isWideFormatService = service.id === 'print' || service.title === 'Широкоформатная печать';
    if (isWideFormatService) return '/wide-format-printing';
    const isPlotterService = service.id === 'plotter' || service.title === 'Плоттерная резка';
    if (isPlotterService) return '/plotter-cutting';
    const isHeatTransferService = service.id === 'thermo' || service.title === 'Термоперенос на футболки и кружки';
    if (isHeatTransferService) return '/heat-transfer';
    const isOutdoorService = service.id === 'outdoor' || service.title === 'Наружная реклама';
    if (isOutdoorService) return '/outdoor-advertising';
    return `/${service.slug || ''}`;
  };

  return (
    <div className="space-y-6 bg-neutral-100 py-16 dark:bg-neutral-950">
      <h1 className="text-2xl font-bold">Список услуг</h1>
      <div className="space-y-8 p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id || service.slug || service.title}
              title={service.title || 'Услуга'}
              desc={service.description || ''}
              href={resolveServiceHref(service)}
            />
          ))}
        </div>

        <section className="card p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Печать на кружках</h2>
              <p className="mt-2 text-neutral-700">Белые керамические кружки 330 мл. Класс ААА. Срок 3–5 рабочих дней.</p>
              <p className="mt-3 text-lg font-semibold text-red-600">450 ₽/шт (круговой перенос)</p>
            </div>
            <a href="#mugs-form" className="btn-primary inline-flex items-center justify-center no-underline">
              Оставить заявку
            </a>
          </div>

          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            <li>От 10 шт - скидка 10%</li>
            <li>3 макета входят в стоимость</li>
            <li>Глянец или мат (на выбор)</li>
          </ul>
        </section>

        <OrderMugsForm />
      </div>
    </div>
  );
}

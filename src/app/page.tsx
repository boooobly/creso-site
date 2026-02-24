import HomePageContent from '@/components/home/HomePageContent';
import servicesLocal from '@/data/services.json';
import portfolioLocal from '@/data/portfolio.json';
import faqLocal from '@/data/faq.json';
import { getServices, getPortfolio, getFaq } from '@/lib/contentful';
import { messages } from '@/lib/messages';

export default async function Home() {
  const [sCMS, pCMS, fCMS] = await Promise.all([
    getServices().catch(() => null),
    getPortfolio().catch(() => null),
    getFaq().catch(() => null),
  ]);

  const services = (sCMS ?? servicesLocal) as any[];
  const portfolio = (pCMS ?? portfolioLocal) as any[];
  const faq = (fCMS ?? faqLocal) as any[];

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
    const isOutdoorService = service?.id === 'outdoor' || service?.title === 'Наружная реклама';
    if (isOutdoorService) return '/outdoor-advertising';
    return `/${service.slug}`;
  };

  const servicesWithHref = services.map((service) => ({
    id: String(service.id),
    title: String(service.title),
    description: String(service.description ?? ''),
    href: resolveServiceHref(service),
  }));

  const portfolioPreview = portfolio.map((item) => ({
    id: String(item.id),
    title: String(item.title),
    category: String(item.category ?? 'Проект'),
  }));

  return <HomePageContent services={servicesWithHref} portfolio={portfolioPreview} faq={faq} messages={messages} />;
}

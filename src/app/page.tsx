import HomePageContent from '@/components/home/HomePageContent';
import servicesLocal from '@/data/services.json';
import faqLocal from '@/data/faq.json';
import { getServices, getFaq } from '@/lib/contentful';
import { messages } from '@/lib/messages';
import { getFeaturedPortfolioItems } from '@/lib/public-portfolio';
import { getPageContentMap, getPageContentValue } from '@/lib/page-content';

export default async function Home() {
  const [sCMS, fCMS, featuredPortfolio, contentMap] = await Promise.all([
    getServices().catch(() => null),
    getFaq().catch(() => null),
    getFeaturedPortfolioItems(3).catch(() => []),
    getPageContentMap('home'),
  ]);

  const services = (sCMS ?? servicesLocal) as any[];
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
    const isStandsService = service?.id === 'stands' || service?.title === 'Изготовление стендов';
    if (isStandsService) return '/services/stands';
    const isOutdoorService = service?.id === 'outdoor' || service?.title === 'Наружная реклама';
    if (isOutdoorService) return '/outdoor-advertising';
    return `/${service.slug}`;
  };


  const featuredPortfolioItems = (featuredPortfolio.length > 0
    ? featuredPortfolio
    : [
        {
          id: 'som',
          title: 'Рекламная стела для СОМ',
          shortDescription:
            'Многоуровневая рекламная конструкция с яркими рекламными блоками для сети строительных материалов.',
          image: '/images/home_page/examples_of_work/som.png',
        },
        {
          id: 'nevinnomyssk',
          title: 'Въездная стела Невинномысск',
          shortDescription:
            'Крупная городская конструкция с объемными элементами и чистой современной подачей.',
          image: '/images/home_page/examples_of_work/nevinnomyssk.png',
        },
        {
          id: 'apple-time',
          title: 'Световой лайтбокс Apple Time',
          shortDescription:
            'Подвесной световой короб для торговой точки с аккуратной подсветкой и читаемой навигацией.',
          image: '/images/home_page/examples_of_work/apple.png',
        },
      ]).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.shortDescription ?? '',
    imageSrc: item.image,
  }));


  const homeHeroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Производство рекламы под ключ');
  const homeHeroDescription = getPageContentValue(
    contentMap,
    'hero',
    'description',
    'Вывески, печать, конструкции и монтаж. От идеи до установки.'
  );
  const homeHeroPrimaryButtonText = getPageContentValue(contentMap, 'hero', 'primaryButtonText', 'Рассчитать стоимость');
  const homeHeroSecondaryButtonText = getPageContentValue(contentMap, 'hero', 'secondaryButtonText', 'Смотреть портфолио');
  const portfolioBlockTitle = getPageContentValue(contentMap, 'portfolio_preview', 'title', 'Примеры работ');
  const portfolioBlockDescription = getPageContentValue(
    contentMap,
    'portfolio_preview',
    'description',
    'Примеры работ, где сочетаются дизайн, точная реализация и соблюдение сроков.'
  );

  const servicesWithHref = services.map((service) => ({
    id: String(service.id),
    title: String(service.title),
    description: String(service.description ?? ''),
    href: resolveServiceHref(service),
  }));

  return (
    <div className="home-page-root">
      <HomePageContent
        services={servicesWithHref}
        faq={faq}
        messages={messages}
        featuredPortfolioItems={featuredPortfolioItems}
        heroTitle={homeHeroTitle}
        heroDescription={homeHeroDescription}
        heroPrimaryButtonText={homeHeroPrimaryButtonText}
        heroSecondaryButtonText={homeHeroSecondaryButtonText}
        portfolioBlockTitle={portfolioBlockTitle}
        portfolioBlockDescription={portfolioBlockDescription}
      />
    </div>
  );
}

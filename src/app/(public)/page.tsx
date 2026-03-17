import HomePageContent from '@/components/home/HomePageContent';
import servicesLocal from '@/data/services.json';
import faqLocal from '@/data/faq.json';
import { getServices, getFaq } from '@/lib/contentful';
import { messages } from '@/lib/messages';
import { getFeaturedPortfolioItems } from '@/lib/public-portfolio';
import { getFaqItemsFromContentMap, getPageContentList, getPageContentMap, getPageContentValue } from '@/lib/page-content';
import { getSiteImage } from '@/lib/site-images';

export default async function Home() {
  const [sCMS, fCMS, featuredPortfolio, contentMap, homeHeroImage] = await Promise.all([
    getServices().catch(() => null),
    getFaq().catch(() => null),
    getFeaturedPortfolioItems(3).catch(() => []),
    getPageContentMap('home'),
    getSiteImage('home.hero.main'),
  ]);

  const services = (sCMS ?? servicesLocal) as any[];
  const faq = (fCMS ?? faqLocal) as any[];

  const adminFaqItems = getFaqItemsFromContentMap(contentMap, 'faq', 4);
  const faqItems = adminFaqItems.length > 0 ? adminFaqItems : faq;

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

  const homeHeroEyebrow = getPageContentValue(contentMap, 'hero', 'eyebrow', 'ПРОИЗВОДСТВЕННАЯ СТУДИЯ CREDOMIR');
  const homeHeroTitle = getPageContentValue(contentMap, 'hero', 'title', 'Производство рекламы под ключ');
  const homeHeroDescription = getPageContentValue(
    contentMap,
    'hero',
    'description',
    'Вывески, печать, конструкции и монтаж. От идеи до установки.'
  );
  const homeHeroPrimaryButtonText = getPageContentValue(contentMap, 'hero', 'primaryButtonText', 'Рассчитать стоимость');
  const homeHeroSecondaryButtonText = getPageContentValue(contentMap, 'hero', 'secondaryButtonText', 'Смотреть портфолио');
  const homeHeroBadges = getPageContentList(
    contentMap,
    'hero',
    'trustBadges',
    [
      { label: 'Собственное производство' },
      { label: 'Монтажная бригада' },
      { label: 'Работаем по договору' },
      { label: 'Гарантия 5 лет' },
    ],
    ['label']
  );

  const trustSectionEyebrow = getPageContentValue(contentMap, 'trust_section', 'eyebrow', 'ПОЧЕМУ НАМ ДОВЕРЯЮТ');
  const trustSectionTitle = getPageContentValue(contentMap, 'trust_section', 'title', 'С нами проще работать');
  const trustFeatureCards = getPageContentList(
    contentMap,
    'trust_section',
    'featureCards',
    [
      { title: 'Берём задачу под ключ', description: 'От замера и макета до производства и монтажа.' },
      { title: 'Подбираем решение под бюджет', description: 'Предлагаем оптимальный вариант под вашу задачу.' },
      { title: 'Держим сроки', description: 'Сразу говорим реальные сроки без лишних обещаний.' },
      { title: 'Всегда можно уточнить детали', description: 'Помогаем по материалам, размерам и конструкции.' },
    ],
    ['title', 'description']
  );

  const portfolioBlockTitle = getPageContentValue(contentMap, 'portfolio_preview', 'title', 'Примеры работ');
  const portfolioBlockDescription = getPageContentValue(
    contentMap,
    'portfolio_preview',
    'description',
    'Примеры работ, где сочетаются дизайн, точная реализация и соблюдение сроков.'
  );
  const portfolioLinkLabel = getPageContentValue(contentMap, 'portfolio_preview', 'linkLabel', 'Смотреть всё портфолио');

  const processEyebrow = getPageContentValue(contentMap, 'process', 'eyebrow', 'ПРОЦЕСС');
  const processTitle = getPageContentValue(contentMap, 'process', 'title', 'Как мы запускаем ваш проект');
  const processDescription = getPageContentValue(
    contentMap,
    'process',
    'description',
    'Понятные этапы, реальные сроки и контроль качества на каждом шаге.'
  );
  const processSteps = getPageContentList(
    contentMap,
    'process',
    'steps',
    [
      { title: 'Бриф и расчёт', description: 'Уточняем задачу, сроки и бюджет. Подбираем формат, материалы и решение.' },
      { title: 'Макет и согласование', description: 'Готовим визуализацию, уточняем детали и согласовываем финальный вариант.' },
      { title: 'Производство', description: 'Запускаем проект на собственных мощностях и контролируем качество на каждом этапе.' },
      { title: 'Монтаж и передача', description: 'Организуем доставку, установку или передачу готового тиража.' },
    ],
    ['title', 'description']
  );

  const faqEyebrow = getPageContentValue(contentMap, 'faq', 'eyebrow', 'FAQ');
  const faqTitle = getPageContentValue(contentMap, 'faq', 'title', 'Частые вопросы');
  const faqDescription = getPageContentValue(
    contentMap,
    'faq',
    'description',
    'Коротко ответили на вопросы, которые чаще всего возникают перед запуском проекта.'
  );
  const faqLinkLabel = getPageContentValue(contentMap, 'faq', 'linkLabel', 'Задать свой вопрос');

  const leadEyebrow = getPageContentValue(contentMap, 'lead', 'eyebrow', 'ЗАЯВКА');
  const leadDescription = getPageContentValue(contentMap, 'lead', 'description', 'Опишите задачу — предложим формат, сроки и стоимость.');
  const leadPoints = getPageContentList(
    contentMap,
    'lead',
    'points',
    [
      { label: 'Расчёт стоимости и сроков в день обращения' },
      { label: 'Подбор материалов под бюджет и задачу' },
      { label: 'Один менеджер на всём цикле проекта' },
    ],
    ['label']
  );

  const homeHeroImageSrc = homeHeroImage?.url ?? '/images/home_page/hero.png';
  const homeHeroImageAlt = homeHeroImage?.altText || 'Производственная студия Credomir';

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
        faq={faqItems}
        messages={messages}
        featuredPortfolioItems={featuredPortfolioItems}
        heroEyebrow={homeHeroEyebrow}
        heroTitle={homeHeroTitle}
        heroDescription={homeHeroDescription}
        heroPrimaryButtonText={homeHeroPrimaryButtonText}
        heroSecondaryButtonText={homeHeroSecondaryButtonText}
        heroTrustBadges={homeHeroBadges}
        trustSectionEyebrow={trustSectionEyebrow}
        trustSectionTitle={trustSectionTitle}
        trustFeatureCards={trustFeatureCards}
        portfolioBlockTitle={portfolioBlockTitle}
        portfolioBlockDescription={portfolioBlockDescription}
        portfolioLinkLabel={portfolioLinkLabel}
        processEyebrow={processEyebrow}
        processTitle={processTitle}
        processDescription={processDescription}
        processSteps={processSteps}
        faqEyebrow={faqEyebrow}
        faqTitle={faqTitle}
        faqDescription={faqDescription}
        faqLinkLabel={faqLinkLabel}
        leadEyebrow={leadEyebrow}
        leadDescription={leadDescription}
        leadPoints={leadPoints}
        heroImageSrc={homeHeroImageSrc}
        heroImageAlt={homeHeroImageAlt}
      />
    </div>
  );
}

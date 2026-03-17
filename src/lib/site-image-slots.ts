export type SiteImageSlotDefinition = {
  key: string;
  label: string;
  pageTitle: string;
  sectionLabel: string;
  usageLabel: string;
  route: string;
  fallbackUrl: string;
  fallbackAlt: string;
  groupKey: string;
  groupLabel: string;
};

export const SITE_IMAGE_SLOTS: SiteImageSlotDefinition[] = [
  {
    key: 'home.hero.main',
    label: 'Главная — главный экран',
    pageTitle: 'Главная',
    sectionLabel: 'Первый экран',
    usageLabel: 'Фоновое изображение на первом экране главной страницы',
    route: '/',
    fallbackUrl: '/images/home_page/hero.png',
    fallbackAlt: 'Производственная студия Credomir',
    groupKey: 'home',
    groupLabel: 'Главная страница',
  },
  {
    key: 'outdoor.hero.main',
    label: 'Наружная реклама — главный экран',
    pageTitle: 'Наружная реклама',
    sectionLabel: 'Первый экран',
    usageLabel: 'Ключевая иллюстрация страницы услуги «Наружная реклама»',
    route: '/outdoor-advertising',
    fallbackUrl: '/images/outdoor_advertising/manufacturing.png',
    fallbackAlt: 'Производство наружной рекламы',
    groupKey: 'services',
    groupLabel: 'Страницы услуг',
  },
  {
    key: 'production.hero.main',
    label: 'Производство — главный экран',
    pageTitle: 'Производство',
    sectionLabel: 'Первый экран',
    usageLabel: 'Ключевая иллюстрация страницы услуги «Производство»',
    route: '/production',
    fallbackUrl: '/images/production/hero.png',
    fallbackAlt: 'Собственное производство рекламы',
    groupKey: 'services',
    groupLabel: 'Страницы услуг',
  },
];

export const SITE_IMAGE_SLOT_KEYS = new Set(SITE_IMAGE_SLOTS.map((slot) => slot.key));

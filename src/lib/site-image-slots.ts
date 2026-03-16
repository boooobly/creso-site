export type SiteImageSlotDefinition = {
  key: string;
  label: string;
  pageTitle: string;
  sectionLabel: string;
  usageLabel: string;
  route: string;
  fallbackUrl: string;
  fallbackAlt: string;
};

export const SITE_IMAGE_SLOTS: SiteImageSlotDefinition[] = [
  {
    key: 'home.hero.main',
    label: 'Главная — главный экран',
    pageTitle: 'Главная',
    sectionLabel: 'Главный экран',
    usageLabel: 'Фоновое изображение первого экрана',
    route: '/',
    fallbackUrl: '/images/home_page/hero.png',
    fallbackAlt: 'Производственная студия Credomir',
  },
  {
    key: 'outdoor.hero.main',
    label: 'Наружная реклама — главный экран',
    pageTitle: 'Наружная реклама',
    sectionLabel: 'Главный экран',
    usageLabel: 'Изображение секции для первого экрана',
    route: '/outdoor-advertising',
    fallbackUrl: '/images/outdoor_advertising/manufacturing.png',
    fallbackAlt: 'Производство наружной рекламы',
  },
  {
    key: 'production.hero.main',
    label: 'Производство — главный экран',
    pageTitle: 'Производство',
    sectionLabel: 'Главный экран',
    usageLabel: 'Главная иллюстрация производственного блока',
    route: '/production',
    fallbackUrl: '/images/production/hero.png',
    fallbackAlt: 'Собственное производство рекламы',
  },
];

export const SITE_IMAGE_SLOT_KEYS = new Set(SITE_IMAGE_SLOTS.map((slot) => slot.key));

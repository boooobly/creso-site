const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultSiteSettings = [
  { key: 'company.name', value: 'CredoMir', type: 'string', group: 'business', label: 'Название компании', description: 'Полное название компании для публичных блоков.' },
  { key: 'company.shortInfo', value: 'Рекламно-производственная компания полного цикла.', type: 'string', group: 'business', label: 'Коротко о компании', description: 'Короткий текст о компании для подвала сайта.' },
  { key: 'contact.phone', value: '+7 (988) 731-74-04', type: 'string', group: 'contact', label: 'Телефон', description: 'Основной номер телефона компании.' },
  { key: 'contact.whatsapp', value: '+7 (988) 731-74-04', type: 'string', group: 'contact', label: 'WhatsApp', description: 'Номер или ссылка WhatsApp для связи.' },
  { key: 'contact.telegram', value: '@Credomir', type: 'string', group: 'contact', label: 'Telegram', description: 'Username или ссылка Telegram.' },
  { key: 'contact.email', value: 'credomir26@mail.ru', type: 'string', group: 'contact', label: 'Email', description: 'Основной адрес электронной почты.' },
  { key: 'contact.address', value: 'ул. Калинина, 106, Невинномысск', type: 'string', group: 'contact', label: 'Адрес', description: 'Фактический адрес офиса или производства.' },
  { key: 'contact.workingHours', value: 'Пн–Пт: 9:00–17:30', type: 'string', group: 'contact', label: 'Режим работы', description: 'Режим работы для сайта.' },
  { key: 'social.vk', value: '', type: 'string', group: 'social', label: 'Ссылка на VK', description: 'Ссылка на страницу компании в VK.' },
  { key: 'footer.text', value: '© 2026 CredoMir. Все права защищены.', type: 'string', group: 'footer', label: 'Текст в подвале', description: 'Короткая строка внизу сайта.' },
  { key: 'seo.defaultTitle', value: 'CredoMir — рекламно-производственная компания', type: 'string', group: 'seo', label: 'SEO заголовок', description: 'Базовый SEO-заголовок по умолчанию.' },
  { key: 'seo.defaultDescription', value: 'Багетное оформление, фрезеровка, широкоформатная печать, наружная реклама в Невинномысске.', type: 'string', group: 'seo', label: 'SEO описание', description: 'Базовое SEO-описание по умолчанию.' },
  { key: 'seo.siteName', value: 'CredoMir', type: 'string', group: 'seo', label: 'Краткое название бренда', description: 'Короткое имя бренда для метаданных.' },
  { key: 'seo.ogImage', value: '/og-image.png', type: 'string', group: 'seo', label: 'OG image URL', description: 'Картинка предпросмотра для соцсетей.' }
];

const defaultPageContent = [
  { pageKey: 'home', sectionKey: 'hero', fieldKey: 'title', value: 'Рекламно-производственная компания', type: 'string', label: 'Page title', description: 'Главный заголовок на первом экране', sortOrder: 10 },
  { pageKey: 'home', sectionKey: 'hero', fieldKey: 'subtitle', value: 'Производим наружную рекламу, печать и брендирование', type: 'string', label: 'Main subtitle', description: 'Короткое пояснение под заголовком', sortOrder: 20 },
  { pageKey: 'home', sectionKey: 'hero', fieldKey: 'ctaButtonText', value: 'Оставить заявку', type: 'string', label: 'Button text', description: 'Текст основной кнопки в первом экране', sortOrder: 30 }
];

const legacyPricingEntries = [
  {
    category: 'business-cards',
    subcategory: 'quantity-1000',
    key: 'pricePerUnit',
    label: 'Цена за 1 шт (тираж 1000)',
    value: 2,
    type: 'number',
    unit: '₽/шт',
    sortOrder: 10,
    isActive: true
  }
];

const defaultPriceCategories = [
  {
    slug: 'general-printing',
    name: 'Общие цены услуг',
    description: 'Основные цены услуг на сайте, не связанные с каталогом багета.',
    kind: 'general',
    sortOrder: 10,
    isActive: true
  },
  {
    slug: 'baguette-extras',
    name: 'Доп. материалы для багета',
    description: 'Только дополнительные материалы: стекло, ПВХ, картон, паспарту, подвесы и другие допы.',
    kind: 'baguette_extras',
    sortOrder: 20,
    isActive: true
  }
];

const defaultPriceItems = [
  { categorySlug: 'baguette-extras', title: 'Стекло', price: '350.00', unit: '₽/м²', description: 'Дополнительная опция к раме', sortOrder: 10, isActive: true },
  { categorySlug: 'baguette-extras', title: 'ПВХ', price: '240.00', unit: '₽/м²', description: 'Основа из ПВХ', sortOrder: 20, isActive: true },
  { categorySlug: 'baguette-extras', title: 'Паспарту', price: '180.00', unit: '₽/шт', description: 'Оформление с паспарту', sortOrder: 30, isActive: true },
  { categorySlug: 'baguette-extras', title: 'Подвесы / крепеж', price: '90.00', unit: '₽/комплект', description: 'Навесная фурнитура', sortOrder: 40, isActive: true }
];

const baguetteExtrasPricingEntries = require('../data/baguette-extras-pricing-defaults.json');
const wideFormatPricingEntries = require('../data/wide-format-pricing-defaults.json');
const printPricingEntries = require('../data/print-pricing-defaults.json');
const millingPricingEntries = require('../data/milling-pricing-defaults.json');


const defaultSiteImageAssets = [
  { title: 'Главная — главный экран', scope: 'site', fileName: 'home.hero.main', url: '/images/home_page/hero.png', altText: 'Производственная студия Credomir', mimeType: 'image/png', isActive: true, sortOrder: 10 },
  { title: 'Главная — портфолио СОМ', scope: 'site', fileName: 'home.portfolio.som', url: '/images/home_page/examples_of_work/som.png', altText: 'Рекламная стела для СОМ', mimeType: 'image/png', isActive: true, sortOrder: 20 },
  { title: 'Главная — портфолио Невинномысск', scope: 'site', fileName: 'home.portfolio.nevinnomyssk', url: '/images/home_page/examples_of_work/nevinnomyssk.png', altText: 'Въездная стела Невинномысск', mimeType: 'image/png', isActive: true, sortOrder: 30 },
  { title: 'Главная — портфолио Apple Time', scope: 'site', fileName: 'home.portfolio.apple', url: '/images/home_page/examples_of_work/apple.png', altText: 'Световой лайтбокс Apple Time', mimeType: 'image/png', isActive: true, sortOrder: 40 },
  { title: 'Наружная реклама — главный экран', scope: 'site', fileName: 'outdoor.hero.main', url: '/images/outdoor_advertising/manufacturing.png', altText: 'Производство наружной рекламы', mimeType: 'image/png', isActive: true, sortOrder: 50 },
  { title: 'Производство — главный экран', scope: 'site', fileName: 'production.hero.main', url: '/images/production/hero.png', altText: 'Собственное производство рекламы', mimeType: 'image/png', isActive: true, sortOrder: 60 },
  { title: 'Стенды — главный экран', scope: 'site', fileName: 'stands.hero.main', url: '/images/stands/hero.png', altText: 'Изготовление информационных стендов', mimeType: 'image/png', isActive: true, sortOrder: 70 },
  { title: 'Кружки — главный экран', scope: 'site', fileName: 'mugs.hero.main', url: '/images/mug/mug-hero.jpg', altText: 'Печать на кружках — пример готовой работы', mimeType: 'image/jpeg', isActive: true, sortOrder: 80 },
  { title: 'Плоттерная резка — пример: стикерпак', scope: 'site', fileName: 'plotter.examples.labels', url: '/images/plotter/plotter_labels.png', altText: 'Стикерпак для бренда', mimeType: 'image/png', isActive: true, sortOrder: 90 },
  { title: 'Плоттерная резка — пример: витрина', scope: 'site', fileName: 'plotter.examples.window', url: '/images/plotter/plotter_window.png', altText: 'Оформление витрины', mimeType: 'image/png', isActive: true, sortOrder: 100 },
  { title: 'Плоттерная резка — пример: резка по меткам', scope: 'site', fileName: 'plotter.examples.stickers', url: '/images/plotter/plotter_stickers.png', altText: 'Резка по меткам', mimeType: 'image/png', isActive: true, sortOrder: 110 },
  { title: 'Плоттерная резка — пример: оклейка машины', scope: 'site', fileName: 'plotter.examples.car', url: '/images/plotter/plotter_car.png', altText: 'Оклейка машины', mimeType: 'image/png', isActive: true, sortOrder: 120 },
  { title: 'Печать на футболках — пример: логотип на груди', scope: 'site', fileName: 'tshirts.examples.logo', url: '/images/t-shirt/logo.png', altText: 'Логотип на груди', mimeType: 'image/png', isActive: true, sortOrder: 130 },
  { title: 'Печать на футболках — главный экран', scope: 'site', fileName: 'tshirts.hero.main', url: '/images/t-shirt/eurochem.png', altText: 'Брендированные футболки для команды', mimeType: 'image/png', isActive: true, sortOrder: 131 },
  { title: 'Печать на футболках — пример: мерч для команды', scope: 'site', fileName: 'tshirts.examples.team', url: '/images/t-shirt/eurochem.png', altText: 'Мерч для команды', mimeType: 'image/png', isActive: true, sortOrder: 140 },
  { title: 'Печать на футболках — пример: термоплёнка', scope: 'site', fileName: 'tshirts.examples.film', url: '/images/t-shirt/termoplenka.png', altText: 'Надпись термоплёнкой', mimeType: 'image/png', isActive: true, sortOrder: 150 },
  { title: 'Стенды — для помещений: Информация', scope: 'site', fileName: 'stands.indoor.info', url: '/images/stands/info.png', altText: 'Стенд «Информация»', mimeType: 'image/png', isActive: true, sortOrder: 160 },
  { title: 'Стенды — для помещений: Уголок потребителя', scope: 'site', fileName: 'stands.indoor.consumer_corner', url: '/images/stands/consumer_corner.png', altText: 'Уголок потребителя', mimeType: 'image/png', isActive: true, sortOrder: 170 },
  { title: 'Стенды — для помещений: Пожарная безопасность', scope: 'site', fileName: 'stands.indoor.fire_safety', url: '/images/stands/fire_safety.png', altText: 'Пожарные стенды', mimeType: 'image/png', isActive: true, sortOrder: 180 },
  { title: 'Стенды — для помещений: Охрана труда', scope: 'site', fileName: 'stands.indoor.labor_protection', url: '/images/stands/labor_protection.png', altText: 'Стенд по охране труда', mimeType: 'image/png', isActive: true, sortOrder: 190 },
  { title: 'Стенды — для помещений: Первая помощь', scope: 'site', fileName: 'stands.indoor.first_aid', url: '/images/stands/first_aid.png', altText: 'Стенд по первой помощи', mimeType: 'image/png', isActive: true, sortOrder: 200 },
  { title: 'Стенды — для помещений: Гражданская оборона и ЧС', scope: 'site', fileName: 'stands.indoor.civil_defense', url: '/images/stands/civil_defense.png', altText: 'Стенд по гражданской обороне и ЧС', mimeType: 'image/png', isActive: true, sortOrder: 210 },
  { title: 'Стенды — уличные: информационный стенд', scope: 'site', fileName: 'stands.outdoor.street_stand', url: '/images/stands/street_stand.png', altText: 'Уличный информационный стенд', mimeType: 'image/png', isActive: true, sortOrder: 220 },
  { title: 'Стенды — уличные: городской стенд', scope: 'site', fileName: 'stands.outdoor.city_stand', url: '/images/stands/city_stand.png', altText: 'Уличный городской стенд', mimeType: 'image/png', isActive: true, sortOrder: 230 },
  { title: 'Стенды — уличные: детские площадки', scope: 'site', fileName: 'stands.outdoor.playgrounds', url: '/images/stands/playgrounds.png', altText: 'Стенд для детской площадки', mimeType: 'image/png', isActive: true, sortOrder: 240 },
  { title: 'Наружная реклама — световые короба', scope: 'site', fileName: 'outdoor.services.lightbox', url: '/images/outdoor_examples/lightbox.png', altText: 'Световые короба', mimeType: 'image/png', isActive: true, sortOrder: 250 },
  { title: 'Наружная реклама — объемные буквы', scope: 'site', fileName: 'outdoor.services.dimensional_letters', url: '/images/outdoor_examples/dimensional_letters.png', altText: 'Объемные буквы', mimeType: 'image/png', isActive: true, sortOrder: 260 },
  { title: 'Наружная реклама — контражурные буквы', scope: 'site', fileName: 'outdoor.services.backlit_sign', url: '/images/outdoor_examples/backlit_sign.png', altText: 'Контражурные буквы', mimeType: 'image/png', isActive: true, sortOrder: 270 },
  { title: 'Наружная реклама — крышные установки', scope: 'site', fileName: 'outdoor.services.roof_sign', url: '/images/outdoor_examples/roof_sign.png', altText: 'Крышные установки', mimeType: 'image/png', isActive: true, sortOrder: 280 },
  { title: 'Наружная реклама — баннеры', scope: 'site', fileName: 'outdoor.services.banner', url: '/images/outdoor_examples/banner.png', altText: 'Баннеры', mimeType: 'image/png', isActive: true, sortOrder: 290 },
  { title: 'Наружная реклама — лайтбоксы', scope: 'site', fileName: 'outdoor.services.lightbox_cube', url: '/images/outdoor_examples/lightbox_cube.png', altText: 'Лайтбоксы', mimeType: 'image/png', isActive: true, sortOrder: 300 },
  { title: 'Наружная реклама — гибкий неон', scope: 'site', fileName: 'outdoor.services.neon', url: '/images/outdoor_examples/neon.png', altText: 'Гибкий неон', mimeType: 'image/png', isActive: true, sortOrder: 310 },
  { title: 'Наружная реклама — стелы', scope: 'site', fileName: 'outdoor.services.stela', url: '/images/outdoor_examples/stela.png', altText: 'Стелы', mimeType: 'image/png', isActive: true, sortOrder: 320 },
  { title: 'Наружная реклама — адресные таблички', scope: 'site', fileName: 'outdoor.services.address_sign', url: '/images/outdoor_examples/adress_sign.png', altText: 'Адресные таблички', mimeType: 'image/png', isActive: true, sortOrder: 330 },
  { title: 'Наружная реклама — сложные конструкции', scope: 'site', fileName: 'outdoor.services.custom', url: '/images/outdoor_examples/custom.png', altText: 'Сложные конструкции любой сложности', mimeType: 'image/png', isActive: true, sortOrder: 340 },
  { title: 'Наружная реклама — портфолио Baton: общий вид', scope: 'site', fileName: 'outdoor.portfolio.baton.main', url: '/images/outdoor_advertising/outdoor_portfolio/baton.png', altText: 'Проект Baton: общий вид рекламной конструкции', mimeType: 'image/png', isActive: true, sortOrder: 350 },
  { title: 'Наружная реклама — портфолио Baton: детали', scope: 'site', fileName: 'outdoor.portfolio.baton.zoom', url: '/images/outdoor_advertising/outdoor_portfolio/baton_zoom.png', altText: 'Проект Baton: крупный план деталей вывески', mimeType: 'image/png', isActive: true, sortOrder: 360 },
  { title: 'Наружная реклама — портфолио Baton: ночной вид', scope: 'site', fileName: 'outdoor.portfolio.baton.night', url: '/images/outdoor_advertising/outdoor_portfolio/baton_night.png', altText: 'Проект Baton: ночной вид с подсветкой', mimeType: 'image/png', isActive: true, sortOrder: 370 },
  { title: 'Наружная реклама — портфолио Cheese: общий вид', scope: 'site', fileName: 'outdoor.portfolio.cheese.main', url: '/images/outdoor_advertising/outdoor_portfolio/cheese.png', altText: 'Проект Cheese: общий вид рекламной конструкции', mimeType: 'image/png', isActive: true, sortOrder: 380 },
  { title: 'Наружная реклама — портфолио Cheese: детали', scope: 'site', fileName: 'outdoor.portfolio.cheese.zoom', url: '/images/outdoor_advertising/outdoor_portfolio/cheese_zoom.png', altText: 'Проект Cheese: крупный план деталей вывески', mimeType: 'image/png', isActive: true, sortOrder: 390 },
  { title: 'Наружная реклама — портфолио Cheese: ночной вид', scope: 'site', fileName: 'outdoor.portfolio.cheese.night', url: '/images/outdoor_advertising/outdoor_portfolio/cheese_night.png', altText: 'Проект Cheese: ночной вид с подсветкой', mimeType: 'image/png', isActive: true, sortOrder: 400 }
];

const defaultMediaAssets = [
  {
    title: 'Временный баннер-заполнитель',
    kind: 'image',
    scope: 'site',
    url: 'https://via.placeholder.com/1200x630?text=Site+Image',
    altText: 'Временное изображение для админки',
    mimeType: 'image/png',
    isActive: true,
    sortOrder: 10
  },
  ...defaultSiteImageAssets.map((item) => ({ kind: 'image', ...item }))
];

async function main() {
  for (const setting of defaultSiteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { type: setting.type, group: setting.group, label: setting.label, description: setting.description },
      create: setting
    });
  }

  for (const content of defaultPageContent) {
    await prisma.pageContent.upsert({
      where: { pageKey_sectionKey_fieldKey: { pageKey: content.pageKey, sectionKey: content.sectionKey, fieldKey: content.fieldKey } },
      update: { label: content.label, description: content.description, type: content.type, sortOrder: content.sortOrder },
      create: content
    });
  }

  for (const entry of legacyPricingEntries) {
    await prisma.pricingEntry.upsert({
      where: { category_subcategory_key: { category: entry.category, subcategory: entry.subcategory, key: entry.key } },
      update: { label: entry.label, type: entry.type, unit: entry.unit, sortOrder: entry.sortOrder, isActive: entry.isActive },
      create: entry
    });
  }

  for (const category of defaultPriceCategories) {
    await prisma.priceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        kind: category.kind,
        sortOrder: category.sortOrder,
        isActive: category.isActive
      },
      create: category
    });
  }

  for (const item of defaultPriceItems) {
    const category = await prisma.priceCategory.findUnique({ where: { slug: item.categorySlug }, select: { id: true } });
    if (!category) continue;

    const existing = await prisma.priceItem.findFirst({ where: { categoryId: category.id, title: item.title } });

    if (existing) {
      await prisma.priceItem.update({
        where: { id: existing.id },
        data: {
          price: new Prisma.Decimal(item.price),
          unit: item.unit,
          description: item.description,
          sortOrder: item.sortOrder,
          isActive: item.isActive
        }
      });
      continue;
    }

    await prisma.priceItem.create({
      data: {
        categoryId: category.id,
        title: item.title,
        price: new Prisma.Decimal(item.price),
        unit: item.unit,
        description: item.description,
        sortOrder: item.sortOrder,
        isActive: item.isActive
      }
    });
  }




  for (const entry of wideFormatPricingEntries) {
    await prisma.pricingEntry.upsert({
      where: {
        category_subcategory_key: {
          category: entry.category,
          subcategory: entry.subcategory,
          key: entry.key,
        },
      },
      update: {
        label: entry.label,
        type: entry.type,
        unit: entry.unit,
        value: entry.value,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
      create: {
        category: entry.category,
        subcategory: entry.subcategory,
        key: entry.key,
        label: entry.label,
        value: entry.value,
        type: entry.type,
        unit: entry.unit,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
    });
  }


  for (const entry of printPricingEntries) {
    await prisma.pricingEntry.upsert({
      where: {
        category_subcategory_key: {
          category: entry.category,
          subcategory: entry.subcategory,
          key: entry.key,
        },
      },
      update: {
        label: entry.label,
        type: entry.type,
        unit: entry.unit,
        value: entry.value,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
      create: {
        category: entry.category,
        subcategory: entry.subcategory,
        key: entry.key,
        label: entry.label,
        value: entry.value,
        type: entry.type,
        unit: entry.unit,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
    });
  }

  for (const entry of millingPricingEntries) {
    await prisma.pricingEntry.upsert({
      where: {
        category_subcategory_key: {
          category: entry.category,
          subcategory: entry.subcategory,
          key: entry.key,
        },
      },
      update: {
        label: entry.label,
        type: entry.type,
        unit: entry.unit,
        value: entry.value,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
      create: {
        category: entry.category,
        subcategory: entry.subcategory,
        key: entry.key,
        label: entry.label,
        value: entry.value,
        type: entry.type,
        unit: entry.unit,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
    });
  }

  for (const entry of baguetteExtrasPricingEntries) {
    await prisma.pricingEntry.upsert({
      where: {
        category_subcategory_key: {
          category: entry.category,
          subcategory: entry.subcategory,
          key: entry.key,
        },
      },
      update: {
        label: entry.label,
        type: entry.type,
        unit: entry.unit,
        value: entry.value,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
      create: {
        category: entry.category,
        subcategory: entry.subcategory,
        key: entry.key,
        label: entry.label,
        value: entry.value,
        type: entry.type,
        unit: entry.unit,
        sortOrder: entry.sortOrder,
        isActive: true,
      },
    });
  }

  for (const asset of defaultMediaAssets) {
    const existing = await prisma.mediaAsset.findFirst({
      where: asset.fileName
        ? {
            OR: [{ fileName: asset.fileName }, { url: asset.url }],
          }
        : { url: asset.url },
    });

    if (existing) {
      await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          title: asset.title,
          kind: asset.kind,
          scope: asset.scope,
          url: asset.url,
          fileName: asset.fileName,
          altText: asset.altText,
          mimeType: asset.mimeType,
          isActive: asset.isActive,
          sortOrder: asset.sortOrder,
        }
      });
      continue;
    }

    await prisma.mediaAsset.create({ data: asset });
  }

  console.log('Seed completed for admin foundation models.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

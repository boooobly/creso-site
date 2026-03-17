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

const defaultMediaAssets = [
  {
    title: 'Временный баннер-заполнитель',
    kind: 'image',
    url: 'https://via.placeholder.com/1200x630?text=Site+Image',
    altText: 'Временное изображение для админки',
    mimeType: 'image/png',
    isActive: true,
    sortOrder: 10
  }
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
    const existing = await prisma.mediaAsset.findFirst({ where: { url: asset.url } });

    if (existing) {
      await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          title: asset.title,
          kind: asset.kind,
          altText: asset.altText,
          mimeType: asset.mimeType,
          isActive: asset.isActive,
          sortOrder: asset.sortOrder
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

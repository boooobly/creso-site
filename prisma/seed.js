const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultSiteSettings = [
  {
    key: 'contact.phone',
    value: '',
    type: 'string',
    group: 'contact',
    label: 'Телефон',
    description: 'Основной контактный телефон компании'
  },
  {
    key: 'contact.email',
    value: '',
    type: 'string',
    group: 'contact',
    label: 'Email',
    description: 'Основной email для связи'
  },
  {
    key: 'contact.address',
    value: '',
    type: 'string',
    group: 'contact',
    label: 'Адрес',
    description: 'Фактический адрес офиса/производства'
  },
  {
    key: 'company.inn',
    value: '',
    type: 'string',
    group: 'company',
    label: 'ИНН',
    description: 'ИНН юридического лица'
  },
  {
    key: 'footer.telegram',
    value: '',
    type: 'string',
    group: 'footer',
    label: 'Telegram',
    description: 'Ссылка на Telegram в подвале'
  },
  {
    key: 'seo.defaultTitle',
    value: '',
    type: 'string',
    group: 'seo',
    label: 'SEO заголовок по умолчанию',
    description: 'Базовый title для страниц без явного значения'
  }
];

const defaultPageContent = [
  {
    pageKey: 'home',
    sectionKey: 'hero',
    fieldKey: 'title',
    value: 'Рекламно-производственная компания',
    type: 'string',
    label: 'Заголовок',
    description: 'Главный заголовок первого экрана',
    sortOrder: 10
  },
  {
    pageKey: 'home',
    sectionKey: 'hero',
    fieldKey: 'subtitle',
    value: 'Производим наружную рекламу, печать и брендирование',
    type: 'string',
    label: 'Подзаголовок',
    description: 'Поясняющий текст первого экрана',
    sortOrder: 20
  }
];

const defaultPricingEntries = [
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

async function main() {
  for (const setting of defaultSiteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        type: setting.type,
        group: setting.group,
        label: setting.label,
        description: setting.description
      },
      create: setting
    });
  }

  for (const content of defaultPageContent) {
    await prisma.pageContent.upsert({
      where: {
        pageKey_sectionKey_fieldKey: {
          pageKey: content.pageKey,
          sectionKey: content.sectionKey,
          fieldKey: content.fieldKey
        }
      },
      update: {
        label: content.label,
        description: content.description,
        type: content.type,
        sortOrder: content.sortOrder
      },
      create: content
    });
  }

  for (const entry of defaultPricingEntries) {
    await prisma.pricingEntry.upsert({
      where: {
        category_subcategory_key: {
          category: entry.category,
          subcategory: entry.subcategory,
          key: entry.key
        }
      },
      update: {
        label: entry.label,
        type: entry.type,
        unit: entry.unit,
        sortOrder: entry.sortOrder,
        isActive: entry.isActive
      },
      create: entry
    });
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

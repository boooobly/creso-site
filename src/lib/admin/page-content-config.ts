export type PageContentFieldType = 'text' | 'textarea';

export type PageContentFieldDefinition = {
  sectionKey: string;
  fieldKey: string;
  label: string;
  helper?: string;
  type: PageContentFieldType;
  defaultValue: string;
};

export type PageContentSectionDefinition = {
  key: string;
  title: string;
  description?: string;
  fields: PageContentFieldDefinition[];
};

export type PageContentPageDefinition = {
  key: string;
  title: string;
  route: string;
  sections: PageContentSectionDefinition[];
};

export const PAGE_CONTENT_DEFINITIONS: PageContentPageDefinition[] = [
  {
    key: 'home',
    title: 'Главная',
    route: '/',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Производство рекламы под ключ' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Вывески, печать, конструкции и монтаж. От идеи до установки.' },
          { sectionKey: 'hero', fieldKey: 'primaryButtonText', label: 'Текст основной кнопки', type: 'text', defaultValue: 'Рассчитать стоимость' },
          { sectionKey: 'hero', fieldKey: 'secondaryButtonText', label: 'Текст второй кнопки', type: 'text', defaultValue: 'Смотреть портфолио' },
        ],
      },
      {
        key: 'portfolio_preview',
        title: 'Блок портфолио',
        fields: [
          { sectionKey: 'portfolio_preview', fieldKey: 'title', label: 'Заголовок блока', type: 'text', defaultValue: 'Примеры работ' },
          { sectionKey: 'portfolio_preview', fieldKey: 'description', label: 'Описание блока', type: 'textarea', defaultValue: 'Примеры работ, где сочетаются дизайн, точная реализация и соблюдение сроков.' },
        ],
      },
    ],
  },
  {
    key: 'baget',
    title: 'Багет',
    route: '/baget',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Конфигуратор багета' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Подберите профиль, оцените превью и получите точный расчёт стоимости.' },
        ],
      },
    ],
  },
  {
    key: 'wide_format',
    title: 'Широкоформатная печать',
    route: '/wide-format-printing',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Широкоформатная печать до 3.2 м' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Материалы, интерьерная/уличная печать, варианты постобработки.' },
        ],
      },
      {
        key: 'cta',
        title: 'CTA блок',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'Заголовок CTA', type: 'text', defaultValue: 'Нужна фигурная резка?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'Описание CTA', type: 'textarea', defaultValue: 'Перейдите к услуге плоттерной резки.' },
          { sectionKey: 'cta', fieldKey: 'buttonText', label: 'Текст кнопки', type: 'text', defaultValue: 'Перейти к плоттерной резке' },
        ],
      },
    ],
  },
  {
    key: 'heat_transfer',
    title: 'Печать на футболках',
    route: '/heat-transfer',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Печать на футболках' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Полноцвет A4 — 250 ₽ за 1 сторону. Работаем на ваших или наших футболках.' },
          { sectionKey: 'hero', fieldKey: 'primaryButtonText', label: 'Текст основной кнопки', type: 'text', defaultValue: 'Оставить заявку' },
          { sectionKey: 'hero', fieldKey: 'secondaryButtonText', label: 'Текст второй кнопки', type: 'text', defaultValue: 'Смотреть примеры' },
        ],
      },
    ],
  },
  {
    key: 'outdoor',
    title: 'Наружная реклама',
    route: '/outdoor-advertising',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Наружная реклама под ключ в Ставропольском крае' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Проектирование, производство и монтаж рекламных конструкций любой сложности по ЮФО.' },
          { sectionKey: 'hero', fieldKey: 'primaryButtonText', label: 'Текст основной кнопки', type: 'text', defaultValue: 'Получить бесплатный расчет' },
          { sectionKey: 'hero', fieldKey: 'secondaryButtonText', label: 'Текст второй кнопки', type: 'text', defaultValue: 'Смотреть примеры работ' },
        ],
      },
      {
        key: 'cta',
        title: 'CTA блок',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'Заголовок CTA', type: 'text', defaultValue: 'Нужна срочная установка?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'Описание CTA', type: 'textarea', defaultValue: 'Изготавливаем и монтируем конструкции в сжатые сроки.' },
          { sectionKey: 'cta', fieldKey: 'buttonText', label: 'Текст кнопки', type: 'text', defaultValue: 'Получить расчет' },
        ],
      },
    ],
  },
  {
    key: 'production',
    title: 'Производство',
    route: '/production',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Собственное производство рекламы' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Производим вывески, конструкции и печатную продукцию на собственном оборудовании с контролем качества на каждом этапе.' },
          { sectionKey: 'hero', fieldKey: 'primaryButtonText', label: 'Текст основной кнопки', type: 'text', defaultValue: 'Обсудить проект' },
          { sectionKey: 'hero', fieldKey: 'secondaryButtonText', label: 'Текст второй кнопки', type: 'text', defaultValue: 'Смотреть оборудование' },
        ],
      },
      {
        key: 'cta',
        title: 'CTA блок',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'Заголовок CTA', type: 'text', defaultValue: 'Готовы обсудить задачу?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'Описание CTA', type: 'textarea', defaultValue: 'Расскажите о проекте — подберём материалы, сроки и предложим решение под ваш бюджет.' },
        ],
      },
    ],
  },
  {
    key: 'contacts',
    title: 'Контакты',
    route: '/contacts',
    sections: [
      {
        key: 'hero',
        title: 'Hero',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Контакты' },
        ],
      },
      {
        key: 'cta',
        title: 'CTA блок',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'Заголовок CTA', type: 'text', defaultValue: 'Нужна консультация?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'Описание CTA', type: 'textarea', defaultValue: 'Ответим в течение 15 минут в рабочее время.' },
          { sectionKey: 'cta', fieldKey: 'buttonText', label: 'Текст кнопки', type: 'text', defaultValue: 'Перезвоните мне' },
        ],
      },
    ],
  },
];

export function getPageContentDefinition(pageKey: string) {
  return PAGE_CONTENT_DEFINITIONS.find((page) => page.key === pageKey);
}

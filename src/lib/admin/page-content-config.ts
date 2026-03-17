export type PageContentFieldType = 'text' | 'textarea' | 'list';

export type PageContentListItemField = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
};

export type PageContentListSchema = {
  itemName: string;
  minItems?: number;
  maxItems?: number;
  fields: PageContentListItemField[];
};

export type PageContentFieldDefinition = {
  sectionKey: string;
  fieldKey: string;
  label: string;
  helper?: string;
  type: PageContentFieldType;
  defaultValue: string;
  listSchema?: PageContentListSchema;
};

function listField(params: {
  sectionKey: string;
  fieldKey: string;
  label: string;
  helper?: string;
  defaultItems: Array<Record<string, string>>;
  listSchema: PageContentListSchema;
}): PageContentFieldDefinition {
  return {
    sectionKey: params.sectionKey,
    fieldKey: params.fieldKey,
    label: params.label,
    helper: params.helper,
    type: 'list',
    defaultValue: JSON.stringify(params.defaultItems),
    listSchema: params.listSchema,
  };
}

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
        title: 'Первый экран',
        description: 'Главный заголовок и кнопки на первом экране.',
        fields: [
          { sectionKey: 'hero', fieldKey: 'eyebrow', label: 'Короткая подпись над заголовком', type: 'text', defaultValue: 'ПРОИЗВОДСТВЕННАЯ СТУДИЯ CREDOMIR' },
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Производство рекламы под ключ' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Вывески, печать, конструкции и монтаж. От идеи до установки.' },
          { sectionKey: 'hero', fieldKey: 'primaryButtonText', label: 'Текст кнопки', helper: 'Основная кнопка', type: 'text', defaultValue: 'Рассчитать стоимость' },
          { sectionKey: 'hero', fieldKey: 'secondaryButtonText', label: 'Текст кнопки', helper: 'Вторая кнопка', type: 'text', defaultValue: 'Смотреть портфолио' },
          listField({
            sectionKey: 'hero',
            fieldKey: 'trustBadges',
            label: 'Бейджи доверия под кнопками',
            helper: 'Короткие факты в первом экране (до 6 пунктов).',
            defaultItems: [
              { label: 'Собственное производство' },
              { label: 'Монтажная бригада' },
              { label: 'Работаем по договору' },
              { label: 'Гарантия 5 лет' },
            ],
            listSchema: {
              itemName: 'Бейдж',
              minItems: 1,
              maxItems: 6,
              fields: [{ key: 'label', label: 'Текст бейджа', required: true }],
            },
          }),
        ],
      },
      {
        key: 'trust_section',
        title: 'Почему нам доверяют',
        description: 'Заголовки и карточки преимуществ на главной странице.',
        fields: [
          { sectionKey: 'trust_section', fieldKey: 'eyebrow', label: 'Короткая подпись раздела', type: 'text', defaultValue: 'ПОЧЕМУ НАМ ДОВЕРЯЮТ' },
          { sectionKey: 'trust_section', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'С нами проще работать' },
          listField({
            sectionKey: 'trust_section',
            fieldKey: 'featureCards',
            label: 'Карточки преимуществ',
            helper: 'Карточки показываются в том же порядке, что и в списке.',
            defaultItems: [
              { title: 'Берём задачу под ключ', description: 'От замера и макета до производства и монтажа.' },
              { title: 'Подбираем решение под бюджет', description: 'Предлагаем оптимальный вариант под вашу задачу.' },
              { title: 'Держим сроки', description: 'Сразу говорим реальные сроки без лишних обещаний.' },
              { title: 'Всегда можно уточнить детали', description: 'Помогаем по материалам, размерам и конструкции.' },
            ],
            listSchema: {
              itemName: 'Карточка преимущества',
              minItems: 1,
              maxItems: 8,
              fields: [
                { key: 'title', label: 'Заголовок', required: true },
                { key: 'description', label: 'Описание', required: true },
              ],
            },
          }),
        ],
      },
      {
        key: 'portfolio_preview',
        title: 'Блок портфолио',
        fields: [
          { sectionKey: 'portfolio_preview', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Примеры работ' },
          { sectionKey: 'portfolio_preview', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Примеры работ, где сочетаются дизайн, точная реализация и соблюдение сроков.' },
          { sectionKey: 'portfolio_preview', fieldKey: 'linkLabel', label: 'Текст ссылки', type: 'text', defaultValue: 'Смотреть всё портфолио' },
        ],
      },
      {
        key: 'process',
        title: 'Раздел «Процесс»',
        fields: [
          { sectionKey: 'process', fieldKey: 'eyebrow', label: 'Короткая подпись раздела', type: 'text', defaultValue: 'ПРОЦЕСС' },
          { sectionKey: 'process', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Как мы запускаем ваш проект' },
          { sectionKey: 'process', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Понятные этапы, реальные сроки и контроль качества на каждом шаге.' },
          listField({
            sectionKey: 'process',
            fieldKey: 'steps',
            label: 'Шаги процесса',
            helper: 'От 2 до 6 шагов. Показываются в указанном порядке.',
            defaultItems: [
              { title: 'Бриф и расчёт', description: 'Уточняем задачу, сроки и бюджет. Подбираем формат, материалы и решение.' },
              { title: 'Макет и согласование', description: 'Готовим визуализацию, уточняем детали и согласовываем финальный вариант.' },
              { title: 'Производство', description: 'Запускаем проект на собственных мощностях и контролируем качество на каждом этапе.' },
              { title: 'Монтаж и передача', description: 'Организуем доставку, установку или передачу готового тиража.' },
            ],
            listSchema: {
              itemName: 'Шаг',
              minItems: 2,
              maxItems: 6,
              fields: [
                { key: 'title', label: 'Название шага', required: true },
                { key: 'description', label: 'Описание шага', required: true },
              ],
            },
          }),
        ],
      },
      {
        key: 'faq',
        title: 'FAQ',
        description: 'Вопросы и ответы на главной странице.',
        fields: [
          { sectionKey: 'faq', fieldKey: 'eyebrow', label: 'Короткая подпись раздела', type: 'text', defaultValue: 'FAQ' },
          { sectionKey: 'faq', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Частые вопросы' },
          { sectionKey: 'faq', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Коротко ответили на вопросы, которые чаще всего возникают перед запуском проекта.' },
          { sectionKey: 'faq', fieldKey: 'linkLabel', label: 'Текст ссылки', type: 'text', defaultValue: 'Задать свой вопрос' },
          listField({
            sectionKey: 'faq',
            fieldKey: 'items',
            label: 'Список вопросов и ответов',
            helper: 'Первые 4 пункта выводятся на главной странице.',
            defaultItems: [
              { question: 'Как быстро вы делаете расчёт?', answer: 'Обычно считаем стоимость в день обращения после уточнения задачи.' },
              { question: 'Можно ли работать по договору?', answer: 'Да, при необходимости заключаем договор и фиксируем сроки.' },
              { question: 'Вы занимаетесь монтажом?', answer: 'Да, делаем монтаж собственной бригадой в Ставропольском крае и рядом.' },
              { question: 'Помогаете с подбором материалов?', answer: 'Да, подбираем материалы под бюджет и условия эксплуатации.' },
            ],
            listSchema: {
              itemName: 'Вопрос',
              minItems: 1,
              maxItems: 12,
              fields: [
                { key: 'question', label: 'Вопрос', required: true },
                { key: 'answer', label: 'Ответ', required: true },
              ],
            },
          }),
        ],
      },
      {
        key: 'lead',
        title: 'Финальный CTA-блок с формой',
        fields: [
          { sectionKey: 'lead', fieldKey: 'eyebrow', label: 'Короткая подпись раздела', type: 'text', defaultValue: 'ЗАЯВКА' },
          { sectionKey: 'lead', fieldKey: 'description', label: 'Короткое описание', type: 'textarea', defaultValue: 'Опишите задачу — предложим формат, сроки и стоимость.' },
          listField({
            sectionKey: 'lead',
            fieldKey: 'points',
            label: 'Пункты преимуществ рядом с формой',
            helper: 'Список коротких пунктов слева от формы.',
            defaultItems: [
              { label: 'Расчёт стоимости и сроков в день обращения' },
              { label: 'Подбор материалов под бюджет и задачу' },
              { label: 'Один менеджер на всём цикле проекта' },
            ],
            listSchema: {
              itemName: 'Пункт',
              minItems: 1,
              maxItems: 8,
              fields: [{ key: 'label', label: 'Текст пункта', required: true }],
            },
          }),
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
        title: 'Первый экран',
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
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Широкоформатная печать до 3.2 м' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Материалы, интерьерная/уличная печать, варианты постобработки.' },
        ],
      },
      {
        key: 'cta',
        title: 'CTA',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'CTA заголовок', type: 'text', defaultValue: 'Нужна фигурная резка?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'CTA описание', type: 'textarea', defaultValue: 'Перейдите к услуге плоттерной резки.' },
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
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Печать на футболках' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Полноцвет A4 — 250 ₽ за 1 сторону. Работаем на ваших или наших футболках.' },
          { sectionKey: 'hero', fieldKey: 'primaryButtonText', label: 'Текст кнопки', helper: 'Основная кнопка', type: 'text', defaultValue: 'Оставить заявку' },
          { sectionKey: 'hero', fieldKey: 'secondaryButtonText', label: 'Текст кнопки', helper: 'Вторая кнопка', type: 'text', defaultValue: 'Смотреть примеры' },
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
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Наружная реклама под ключ в Ставропольском крае' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Проектирование, производство и монтаж рекламных конструкций любой сложности по ЮФО.' },
          { sectionKey: 'hero', fieldKey: 'primaryButtonText', label: 'Текст кнопки', helper: 'Основная кнопка', type: 'text', defaultValue: 'Получить бесплатный расчет' },
          { sectionKey: 'hero', fieldKey: 'secondaryButtonText', label: 'Текст кнопки', helper: 'Вторая кнопка', type: 'text', defaultValue: 'Смотреть примеры работ' },
        ],
      },
      {
        key: 'cta',
        title: 'CTA',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'CTA заголовок', type: 'text', defaultValue: 'Нужна срочная установка?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'CTA описание', type: 'textarea', defaultValue: 'Изготавливаем и монтируем конструкции в сжатые сроки.' },
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
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Собственное производство рекламы' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Производим вывески, конструкции и печатную продукцию на собственном оборудовании с контролем качества на каждом этапе.' },
          { sectionKey: 'hero', fieldKey: 'primaryButtonText', label: 'Текст кнопки', helper: 'Основная кнопка', type: 'text', defaultValue: 'Обсудить проект' },
          { sectionKey: 'hero', fieldKey: 'secondaryButtonText', label: 'Текст кнопки', helper: 'Вторая кнопка', type: 'text', defaultValue: 'Смотреть оборудование' },
        ],
      },
      {
        key: 'cta',
        title: 'CTA',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'CTA заголовок', type: 'text', defaultValue: 'Готовы обсудить задачу?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'CTA описание', type: 'textarea', defaultValue: 'Расскажите о проекте — подберём материалы, сроки и предложим решение под ваш бюджет.' },
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
        title: 'Первый экран',
        fields: [{ sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Контакты' }],
      },
      {
        key: 'cta',
        title: 'CTA',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'CTA заголовок', type: 'text', defaultValue: 'Нужна консультация?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'CTA описание', type: 'textarea', defaultValue: 'Ответим в течение 15 минут в рабочее время.' },
          { sectionKey: 'cta', fieldKey: 'buttonText', label: 'Текст кнопки', type: 'text', defaultValue: 'Перезвоните мне' },
        ],
      },
    ],
  },
  {
    key: 'portfolio',
    title: 'Портфолио',
    route: '/portfolio',
    sections: [
      {
        key: 'hero',
        title: 'Вступительный блок',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Портфолио' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Примеры реализованных проектов по печати, вывескам и рекламным конструкциям.' },
        ],
      },
    ],
  },

  {
    key: 'services',
    title: 'Услуги',
    route: '/services',
    sections: [
      {
        key: 'hero',
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'eyebrow', label: 'Короткая подпись', type: 'text', defaultValue: 'УСЛУГИ' },
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Список услуг' },
          {
            sectionKey: 'hero',
            fieldKey: 'description',
            label: 'Описание',
            type: 'textarea',
            defaultValue: 'Выполняем проекты по наружной рекламе, печати и производству под ключ: от расчёта и дизайна до монтажа и сдачи.',
          },
        ],
      },
    ],
  },
  {
    key: 'print',
    title: 'Визитки и флаеры',
    route: '/print',
    sections: [
      {
        key: 'hero',
        title: 'Вступительный блок',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Офсетные визитки' },
          {
            sectionKey: 'hero',
            fieldKey: 'description',
            label: 'Описание',
            type: 'textarea',
            defaultValue: 'Фиксированные параметры печати: 90x50 мм, мелованный картон 300 gsm. Выберите тираж и опции, затем отправьте заявку менеджеру.',
          },
          listField({
            sectionKey: 'hero',
            fieldKey: 'featureChips',
            label: 'Короткие бейджи под описанием',
            helper: 'До 6 коротких пунктов о параметрах услуги.',
            defaultItems: [
              { label: 'Офсетная печать' },
              { label: '300 gsm мелованный картон' },
              { label: 'Кратно 1000' },
              { label: '7–10 рабочих дней' },
            ],
            listSchema: {
              itemName: 'Бейдж',
              minItems: 1,
              maxItems: 6,
              fields: [{ key: 'label', label: 'Текст бейджа', required: true }],
            },
          }),
        ],
      },
    ],
  },
  {
    key: 'milling',
    title: 'Фрезеровка',
    route: '/milling',
    sections: [
      {
        key: 'hero',
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Фрезеровка листовых материалов' },
          {
            sectionKey: 'hero',
            fieldKey: 'description',
            label: 'Описание',
            type: 'textarea',
            defaultValue: 'Выполним раскрой и фигурную резку на ЧПУ. Работаем по вашим макетам и помогаем подготовить файл.',
          },
        ],
      },
      {
        key: 'form',
        title: 'Блок заявки',
        fields: [
          { sectionKey: 'form', fieldKey: 'title', label: 'Заголовок формы', type: 'text', defaultValue: 'Оставьте заявку на фрезеровку' },
          { sectionKey: 'form', fieldKey: 'description', label: 'Описание формы', type: 'textarea', defaultValue: 'Прикрепите макет и укажите задачу — менеджер свяжется с вами для уточнения деталей.' },
        ],
      },
    ],
  },
  {
    key: 'plotter_cutting',
    title: 'Плоттерная резка',
    route: '/plotter-cutting',
    sections: [
      {
        key: 'hero',
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Плоттерная резка самоклеящейся пленки и оракала' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Режем плёнку по контуру, готовим наклейки и элементы для витрин, автомобилей и навигации.' },
        ],
      },
      {
        key: 'form',
        title: 'Блок заявки',
        fields: [
          { sectionKey: 'form', fieldKey: 'title', label: 'Заголовок формы', type: 'text', defaultValue: 'Заявка на плоттерную резку' },
          { sectionKey: 'form', fieldKey: 'successMessage', label: 'Сообщение после отправки', type: 'text', defaultValue: 'Заявка отправлена. Менеджер свяжется с вами в ближайшее время.' },
        ],
      },
      {
        key: 'requirements',
        title: 'Требования к макету',
        fields: [
          { sectionKey: 'requirements', fieldKey: 'title', label: 'Заголовок блока', type: 'text', defaultValue: 'Требования к макету' },
        ],
      },
    ],
  },
  {
    key: 'reviews_page',
    title: 'Страница отзывов',
    route: '/reviews',
    sections: [
      {
        key: 'hero',
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Отзывы реальных клиентов' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Собрали отзывы клиентов, с которыми уже работали по печати, вывескам и монтажу.' },
        ],
      },
      {
        key: 'yandex',
        title: 'Блок Яндекс Карт',
        fields: [
          { sectionKey: 'yandex', fieldKey: 'title', label: 'Заголовок блока', type: 'text', defaultValue: 'Отзывы на Яндекс Картах' },
          { sectionKey: 'yandex', fieldKey: 'buttonText', label: 'Текст кнопки', type: 'text', defaultValue: 'Открыть все отзывы' },
        ],
      },
    ],
  },
  {
    key: 'service_mugs',
    title: 'Печать на кружках',
    route: '/services/mugs',
    sections: [
      {
        key: 'hero',
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'eyebrow', label: 'Короткая подпись', type: 'text', defaultValue: 'Услуги / Сувенирная продукция' },
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Печать на кружках' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Печатаем логотипы, подарочные дизайны и корпоративные серии. Поможем выбрать кружки и подготовить макет.' },
        ],
      },
      {
        key: 'faq',
        title: 'FAQ',
        fields: [
          { sectionKey: 'faq', fieldKey: 'title', label: 'Заголовок FAQ', type: 'text', defaultValue: 'Частые вопросы' },
        ],
      },
    ],
  },
  {
    key: 'service_stands',
    title: 'Изготовление стендов',
    route: '/services/stands',
    sections: [
      {
        key: 'hero',
        title: 'Первый экран',
        fields: [
          { sectionKey: 'hero', fieldKey: 'eyebrow', label: 'Короткая подпись', type: 'text', defaultValue: 'Услуги / Информационные конструкции' },
          { sectionKey: 'hero', fieldKey: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Изготовление информационных стендов' },
          { sectionKey: 'hero', fieldKey: 'description', label: 'Описание', type: 'textarea', defaultValue: 'Производим стенды для офисов, учреждений и уличных площадок. Подбираем формат и комплектацию под задачу.' },
        ],
      },
      {
        key: 'cta',
        title: 'Финальный CTA-блок',
        fields: [
          { sectionKey: 'cta', fieldKey: 'title', label: 'Заголовок CTA', type: 'text', defaultValue: 'Нужен стенд под вашу задачу?' },
          { sectionKey: 'cta', fieldKey: 'description', label: 'Описание CTA', type: 'textarea', defaultValue: 'Опишите формат, место установки и сроки. Подскажем вариант и рассчитаем стоимость.' },
        ],
      },
    ],
  },
];

export function getPageContentDefinition(pageKey: string) {
  return PAGE_CONTENT_DEFINITIONS.find((page) => page.key === pageKey);
}

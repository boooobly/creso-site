import { SITE_SETTING_KEYS } from '@/lib/site-settings';

export type SiteSettingFieldControl = 'text' | 'textarea' | 'email' | 'tel' | 'url';

export type SiteSettingFieldDefinition = {
  key: string;
  inputName: string;
  label: string;
  helper?: string;
  appearsIn?: string;
  placeholder?: string;
  control?: SiteSettingFieldControl;
  required?: boolean;
  caution?: boolean;
};

export type SiteSettingSectionDefinition = {
  title: string;
  description: string;
  fields: SiteSettingFieldDefinition[];
};

export const SITE_SETTINGS_SECTIONS: SiteSettingSectionDefinition[] = [
  {
    title: 'Контактная информация',
    description: 'Эти данные клиенты видят в «Контактах», в шапке и в подвале сайта.',
    fields: [
      {
        key: SITE_SETTING_KEYS.phone,
        inputName: 'phone',
        label: 'Основной телефон',
        placeholder: '+7 (900) 000-00-00',
        helper: 'Главный номер для звонка.',
        appearsIn: 'Страница «Контакты», шапка, подвал',
        control: 'tel',
        required: true,
      },
      {
        key: SITE_SETTING_KEYS.email,
        inputName: 'email',
        label: 'Рабочий email',
        placeholder: 'office@company.ru',
        helper: 'На этот адрес могут писать клиенты.',
        appearsIn: 'Страница «Контакты»',
        control: 'email',
        required: true,
      },
      {
        key: SITE_SETTING_KEYS.address,
        inputName: 'address',
        label: 'Адрес офиса',
        helper: 'Указывайте адрес в привычном для клиента формате.',
        appearsIn: 'Страница «Контакты»',
        placeholder: 'г. Невинномысск, ул. Пример, 10',
        control: 'text',
      },
      {
        key: SITE_SETTING_KEYS.workingHours,
        inputName: 'workingHours',
        label: 'Режим работы',
        placeholder: 'Пн–Пт 9:00–18:00, Сб 10:00–14:00',
        helper: 'Можно указать выходные и обед, если нужно.',
        appearsIn: 'Страница «Контакты» и подвал',
        control: 'text',
      },
    ],
  },
  {
    title: 'Мессенджеры и соцсети',
    description: 'Ссылки для быстрых обращений клиентов через мессенджеры и соцсети.',
    fields: [
      {
        key: SITE_SETTING_KEYS.whatsapp,
        inputName: 'whatsapp',
        label: 'WhatsApp',
        helper: 'Номер или ссылка.',
        appearsIn: 'Кнопки связи и блок контактов',
        placeholder: 'https://wa.me/79000000000',
        control: 'url',
      },
      {
        key: SITE_SETTING_KEYS.telegram,
        inputName: 'telegram',
        label: 'Telegram',
        helper: 'Ссылка или username в формате @company.',
        appearsIn: 'Кнопки связи и блок контактов',
        placeholder: '@company',
        control: 'text',
      },
      {
        key: SITE_SETTING_KEYS.vkLink,
        inputName: 'vkLink',
        label: 'Ссылка на VK',
        appearsIn: 'Подвал и контакты',
        placeholder: 'https://vk.com/your-company',
        control: 'url',
      },
    ],
  },
  {
    title: 'Данные о компании',
    description: 'Тексты о компании, которые повторяются в разных частях сайта.',
    fields: [
      {
        key: SITE_SETTING_KEYS.companyName,
        inputName: 'companyName',
        label: 'Название компании',
        placeholder: 'Например: CredoMir',
        helper: 'Основное название бренда.',
        appearsIn: 'Шапка, подвал, SEO',
        control: 'text',
        required: true,
      },
      {
        key: SITE_SETTING_KEYS.companyShortInfo,
        inputName: 'companyShortInfo',
        label: 'Коротко о компании',
        helper: 'Короткий абзац на 1–2 предложения.',
        appearsIn: 'Подвал сайта',
        placeholder: 'Рекламно-производственная компания полного цикла.',
        control: 'textarea',
      },
      {
        key: SITE_SETTING_KEYS.footerText,
        inputName: 'footerText',
        label: 'Текст внизу сайта',
        helper: 'Обычно это копирайт и год.',
        appearsIn: 'Самый низ сайта (подвал)',
        placeholder: '© 2026 CredoMir. Все права защищены.',
        control: 'text',
      },
    ],
  },
  {
    title: 'SEO и отображение в поиске',
    description: 'Эти поля влияют на то, как сайт выглядит в поиске и при отправке ссылок.',
    fields: [
      {
        key: SITE_SETTING_KEYS.seoSiteName,
        inputName: 'seoSiteName',
        label: 'Название сайта для SEO',
        helper: 'Короткое имя бренда.',
        appearsIn: 'Мета-теги сайта',
        control: 'text',
      },
      {
        key: SITE_SETTING_KEYS.seoTitle,
        inputName: 'seoTitle',
        label: 'SEO-заголовок по умолчанию',
        helper: 'Главный заголовок сайта в поиске.',
        appearsIn: 'Поисковая выдача',
        control: 'text',
        caution: true,
      },
      {
        key: SITE_SETTING_KEYS.seoDescription,
        inputName: 'seoDescription',
        label: 'SEO-описание по умолчанию',
        helper: 'Лучше 120–170 символов.',
        appearsIn: 'Поисковая выдача',
        control: 'textarea',
        caution: true,
      },
      {
        key: SITE_SETTING_KEYS.seoOgImage,
        inputName: 'seoOgImage',
        label: 'Изображение для предпросмотра ссылки (OG)',
        helper: 'Оставьте пустым, чтобы использовать стандартную картинку сайта.',
        appearsIn: 'Соцсети и мессенджеры при отправке ссылок',
        placeholder: 'https://site.ru/og-image.png',
        control: 'url',
        caution: true,
      },
    ],
  },
];

import { SITE_SETTING_KEYS } from '@/lib/site-settings';

export type SiteSettingFieldControl = 'text' | 'textarea' | 'email' | 'tel' | 'url';

export type SiteSettingFieldDefinition = {
  key: string;
  inputName: string;
  label: string;
  helper?: string;
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
        helper: 'Показывается на сайте как главный номер для звонка.',
        control: 'tel',
        required: true,
      },
      {
        key: SITE_SETTING_KEYS.email,
        inputName: 'email',
        label: 'Рабочий Email',
        placeholder: 'office@company.ru',
        helper: 'Сюда могут писать клиенты с сайта.',
        control: 'email',
        required: true,
      },
      {
        key: SITE_SETTING_KEYS.address,
        inputName: 'address',
        label: 'Адрес офиса',
        helper: 'Показывается в разделе «Контакты».',
        control: 'text',
      },
      {
        key: SITE_SETTING_KEYS.workingHours,
        inputName: 'workingHours',
        label: 'Режим работы',
        placeholder: 'Пн–Пт 9:00–18:00, Сб 10:00–14:00',
        helper: 'Укажите график в понятном для клиента формате.',
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
        helper: 'Номер или ссылка, например: https://wa.me/79000000000',
        placeholder: 'https://wa.me/79000000000',
        control: 'url',
      },
      {
        key: SITE_SETTING_KEYS.telegram,
        inputName: 'telegram',
        label: 'Telegram',
        helper: 'Можно указать username (@example) или ссылку.',
        placeholder: '@company',
        control: 'text',
      },
      {
        key: SITE_SETTING_KEYS.vkLink,
        inputName: 'vkLink',
        label: 'Ссылка на VK',
        placeholder: 'https://vk.com/your-company',
        control: 'url',
      },
    ],
  },
  {
    title: 'Данные о компании',
    description: 'Основные тексты о компании, которые повторяются в разных местах сайта.',
    fields: [
      {
        key: SITE_SETTING_KEYS.companyName,
        inputName: 'companyName',
        label: 'Название компании',
        placeholder: 'Например: CredoMir',
        helper: 'Используется как название бренда на сайте.',
        control: 'text',
        required: true,
      },
      {
        key: SITE_SETTING_KEYS.companyShortInfo,
        inputName: 'companyShortInfo',
        label: 'Коротко о компании',
        helper: 'Короткий абзац в подвале и служебных блоках.',
        control: 'textarea',
      },
      {
        key: SITE_SETTING_KEYS.footerText,
        inputName: 'footerText',
        label: 'Текст внизу сайта (подвал)',
        helper: 'Например: © 2026 CredoMir. Все права защищены.',
        control: 'text',
      },
    ],
  },
  {
    title: 'SEO и отображение в поиске',
    description: 'Эти поля влияют на заголовок и описание сайта в поисковых системах и соцсетях.',
    fields: [
      {
        key: SITE_SETTING_KEYS.seoSiteName,
        inputName: 'seoSiteName',
        label: 'Название сайта для SEO',
        helper: 'Используется в мета-тегах и предпросмотре ссылок.',
        control: 'text',
      },
      {
        key: SITE_SETTING_KEYS.seoTitle,
        inputName: 'seoTitle',
        label: 'SEO-заголовок по умолчанию',
        helper: 'Показывается в поисковой выдаче как заголовок страницы.',
        control: 'text',
        caution: true,
      },
      {
        key: SITE_SETTING_KEYS.seoDescription,
        inputName: 'seoDescription',
        label: 'SEO-описание по умолчанию',
        helper: 'Краткое описание сайта в поиске. Лучше 120–170 символов.',
        control: 'textarea',
        caution: true,
      },
      {
        key: SITE_SETTING_KEYS.seoOgImage,
        inputName: 'seoOgImage',
        label: 'Ссылка на изображение для предпросмотра (OG)',
        helper: 'Необязательно. Если оставить пустым — будет стандартная картинка сайта.',
        placeholder: 'https://site.ru/og-image.png',
        control: 'url',
        caution: true,
      },
    ],
  },
];

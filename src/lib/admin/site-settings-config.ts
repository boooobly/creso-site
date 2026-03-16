import { SITE_SETTING_KEYS } from '@/lib/site-settings';

export type SiteSettingFieldDefinition = {
  key: string;
  inputName: string;
  label: string;
  helper?: string;
  placeholder?: string;
};

export type SiteSettingSectionDefinition = {
  title: string;
  description: string;
  fields: SiteSettingFieldDefinition[];
};

export const SITE_SETTINGS_SECTIONS: SiteSettingSectionDefinition[] = [
  {
    title: 'Контакты компании',
    description: 'Эти данные видят клиенты в разделе «Контакты», а также в подвале сайта.',
    fields: [
      { key: SITE_SETTING_KEYS.companyName, inputName: 'companyName', label: 'Название компании', placeholder: 'Например: CredoMir' },
      { key: SITE_SETTING_KEYS.phone, inputName: 'phone', label: 'Телефон', placeholder: '+7 (900) 000-00-00' },
      { key: SITE_SETTING_KEYS.whatsapp, inputName: 'whatsapp', label: 'WhatsApp', helper: 'Номер или ссылка для WhatsApp. Например: https://wa.me/79000000000' },
      { key: SITE_SETTING_KEYS.telegram, inputName: 'telegram', label: 'Telegram', helper: 'Username (@example) или ссылка на канал/чат.' },
      { key: SITE_SETTING_KEYS.email, inputName: 'email', label: 'Email', placeholder: 'office@company.ru' },
      { key: SITE_SETTING_KEYS.address, inputName: 'address', label: 'Адрес' },
      { key: SITE_SETTING_KEYS.workingHours, inputName: 'workingHours', label: 'Режим работы', placeholder: 'Пн–Пт 9:00–18:00, Сб 10:00–14:00' },
    ],
  },
  {
    title: 'Социальные сети и подвал сайта',
    description: 'Служебные поля для ссылок и короткого текста внизу сайта.',
    fields: [
      { key: SITE_SETTING_KEYS.vkLink, inputName: 'vkLink', label: 'Ссылка на VK', placeholder: 'https://vk.com/...' },
      { key: SITE_SETTING_KEYS.companyShortInfo, inputName: 'companyShortInfo', label: 'Коротко о компании', helper: 'Короткий текст для информационного блока в подвале.' },
      { key: SITE_SETTING_KEYS.footerText, inputName: 'footerText', label: 'Текст в подвале', helper: 'Например: © 2026 CredoMir. Все права защищены.' },
    ],
  },
  {
    title: 'SEO по умолчанию',
    description: 'Используется как базовый заголовок/описание для страниц сайта.',
    fields: [
      { key: SITE_SETTING_KEYS.seoSiteName, inputName: 'seoSiteName', label: 'Краткое название бренда' },
      { key: SITE_SETTING_KEYS.seoTitle, inputName: 'seoTitle', label: 'SEO заголовок' },
      { key: SITE_SETTING_KEYS.seoDescription, inputName: 'seoDescription', label: 'SEO описание' },
      { key: SITE_SETTING_KEYS.seoOgImage, inputName: 'seoOgImage', label: 'OG image URL', helper: 'Необязательно. Если пусто — используется текущая картинка сайта.' },
    ],
  },
];

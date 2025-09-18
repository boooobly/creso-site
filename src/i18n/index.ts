export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];

export function getMessages(locale: Locale) {
  switch (locale) {
    case 'en':
      return import('./en').then((m) => m.messages);
    default:
      return import('./ru').then((m) => m.messages);
  }
}
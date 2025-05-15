export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'mm']
} as const;

export const localeName = {
  en: 'English',
  mm: 'မြန်မာ'
};

export type Locale = (typeof i18n)['locales'][number];

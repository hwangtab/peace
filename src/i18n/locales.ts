export const LOCALES = [
  'ko',
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'ru',
  'ar',
  'ja',
  'zh-Hans',
  'zh-Hant',
  'hi',
  'id',
] as const;

export const DEFAULT_LOCALE = 'ko';
export const RTL_LOCALES = ['ar'] as const;

export type Locale = (typeof LOCALES)[number];

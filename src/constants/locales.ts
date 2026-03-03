/**
 * Centralized locale configuration (TypeScript version)
 * Used by middleware and other TypeScript code
 *
 * Note: locales.js contains the CommonJS version for next-i18next.config.js
 */
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

export type Locale = typeof LOCALES[number];

export const isSupportedLocale = (locale?: string): locale is Locale =>
  !!locale && LOCALES.includes(locale as Locale);

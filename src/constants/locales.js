/**
 * Centralized locale configuration
 * Used by middleware, next-i18next config, and other locale-dependent code
 */
const LOCALES = [
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
];

const DEFAULT_LOCALE = 'ko';

const isSupportedLocale = (locale) =>
  !!locale && LOCALES.includes(locale);

module.exports = { LOCALES, DEFAULT_LOCALE, isSupportedLocale };

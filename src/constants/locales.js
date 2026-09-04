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

const isSupportedLocale = (locale) => !!locale && LOCALES.includes(locale);

/**
 * 빌드 시점에 전 경로를 prerender 할 로케일 — locales.ts 와 반드시 동일하게 유지한다.
 * '@/constants/locales' 는 번들러에 따라 이 .js 로 해석될 수 있어(webpack), 여기에
 * 없으면 prerenderLocales is not a function 으로 빌드가 깨진다.
 */
const PRERENDER_LOCALES = ['ko', 'en'];

const prerenderLocales = (locales) =>
  (locales ?? [DEFAULT_LOCALE]).filter((l) => PRERENDER_LOCALES.includes(l));

module.exports = {
  LOCALES,
  DEFAULT_LOCALE,
  isSupportedLocale,
  PRERENDER_LOCALES,
  prerenderLocales,
};

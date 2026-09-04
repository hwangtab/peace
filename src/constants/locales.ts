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

export type Locale = (typeof LOCALES)[number];

export const isSupportedLocale = (locale?: string): locale is Locale =>
  !!locale && LOCALES.includes(locale as Locale);

/**
 * 빌드 시점에 전 경로를 prerender 할 로케일.
 *
 * 변형이 많은 동적 라우트(/videos/[id] 1,885개, /camps/2026/musicians/[id] 650개)를
 * 13 로케일 전량 prerender 하면 빌드가 각각 278s·102s 를 쓴다. 실트래픽의 대부분을
 * 차지하는 ko·en 만 빌드에 굽고 나머지는 fallback: 'blocking' 으로 첫 요청 시 생성해
 * 캐시한다. blocking fallback 은 크롤러에게 완전한 HTML 을 서버 렌더로 돌려주므로
 * 색인에 영향이 없고, sitemap 의 hreflang alternates(next-sitemap.config.js
 * buildAlternateRefs)는 13 로케일 전부를 그대로 노출한다.
 */
export const PRERENDER_LOCALES: readonly string[] = ['ko', 'en'];

/** getStaticPaths 의 locales 를 prerender 대상으로 좁힌다 (locales 미제공 시 ko) */
export const prerenderLocales = (locales?: string[]): string[] =>
  (locales ?? [DEFAULT_LOCALE]).filter((l) => PRERENDER_LOCALES.includes(l));

import { parseAcceptLanguage, normalizeLocale, resolveLocale } from './localeDetection';

describe('parseAcceptLanguage', () => {
  test('sorts languages by quality factor descending', () => {
    expect(parseAcceptLanguage('en;q=0.8, ko;q=1.0, ja;q=0.5')).toEqual(['ko', 'en', 'ja']);
  });

  test('treats languages without q as weight 1', () => {
    expect(parseAcceptLanguage('fr, en;q=0.9')).toEqual(['fr', 'en']);
  });

  test('returns empty array for null/empty header', () => {
    expect(parseAcceptLanguage(null)).toEqual([]);
    expect(parseAcceptLanguage('')).toEqual([]);
  });
});

describe('normalizeLocale', () => {
  test('maps regional variants to supported locale codes', () => {
    expect(normalizeLocale('ko-KR')).toBe('ko');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('pt-BR')).toBe('pt');
  });

  test('distinguishes Simplified vs Traditional Chinese', () => {
    expect(normalizeLocale('zh-Hans-CN')).toBe('zh-Hans');
    expect(normalizeLocale('zh-Hant-TW')).toBe('zh-Hant');
    expect(normalizeLocale('zh-HK')).toBe('zh-Hant');
    expect(normalizeLocale('zh')).toBe('zh-Hans');
  });

  test('returns null for unsupported languages', () => {
    expect(normalizeLocale('th-TH')).toBeNull();
  });
});

describe('resolveLocale', () => {
  test('cookie takes precedence over Accept-Language and geo', () => {
    expect(
      resolveLocale({
        cookieLocale: 'ja',
        acceptLanguage: 'en-US',
        country: 'US',
      })
    ).toBe('ja');
  });

  test('falls back to Accept-Language when no cookie is set', () => {
    expect(
      resolveLocale({
        acceptLanguage: 'fr-FR, en;q=0.8',
        country: 'US',
      })
    ).toBe('fr');
  });

  test('falls back to geo IP country when Accept-Language is missing', () => {
    expect(
      resolveLocale({
        country: 'JP',
      })
    ).toBe('ja');
  });

  test('returns default locale (ko) when nothing matches', () => {
    expect(
      resolveLocale({
        acceptLanguage: 'th-TH',
        country: 'TH',
      })
    ).toBe('ko');
  });

  // Regression: `/` redirect to `/ko` broke sitemap canonical alignment.
  // Middleware now skips redirect when resolved locale equals DEFAULT_LOCALE,
  // but we still verify resolveLocale surfaces 'ko' for Korean visitors.
  test('Korean visitors resolve to default locale `ko`', () => {
    expect(resolveLocale({ acceptLanguage: 'ko-KR', country: 'KR' })).toBe('ko');
    expect(resolveLocale({ country: 'KR' })).toBe('ko');
  });

  test('ignores unsupported cookie values', () => {
    expect(
      resolveLocale({
        cookieLocale: 'xx',
        acceptLanguage: 'en-US',
      })
    ).toBe('en');
  });
});

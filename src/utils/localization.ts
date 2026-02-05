export type SupportedLanguage =
  | 'ko'
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'ru'
  | 'ar'
  | 'ja'
  | 'zh-Hans'
  | 'zh-Hant'
  | 'hi'
  | 'id';

export const getLanguageCode = (language?: string): SupportedLanguage => {
  if (!language) return 'ko';
  const normalized = language.toLowerCase();

  if (normalized.startsWith('ko')) return 'ko';
  if (normalized.startsWith('en')) return 'en';
  if (normalized.startsWith('es')) return 'es';
  if (normalized.startsWith('fr')) return 'fr';
  if (normalized.startsWith('de')) return 'de';
  if (normalized.startsWith('pt')) return 'pt';
  if (normalized.startsWith('ru')) return 'ru';
  if (normalized.startsWith('ar')) return 'ar';
  if (normalized.startsWith('ja')) return 'ja';
  if (normalized.startsWith('zh')) {
    if (normalized.includes('hant') || normalized.includes('tw') || normalized.includes('hk') || normalized.includes('mo')) {
      return 'zh-Hant';
    }
    return 'zh-Hans';
  }
  if (normalized.startsWith('hi')) return 'hi';
  if (normalized.startsWith('id')) return 'id';

  return 'en';
};

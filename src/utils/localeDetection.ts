import { DEFAULT_LOCALE, isSupportedLocale } from '../constants/locales';

const COUNTRY_TO_LOCALE: Record<string, string> = {
  KR: 'ko',
  JP: 'ja',
  CN: 'zh-Hans',
  TW: 'zh-Hant',
  HK: 'zh-Hant',
  MO: 'zh-Hant',
  RU: 'ru',
  FR: 'fr',
  DE: 'de',
  ES: 'es',
  PT: 'pt',
  BR: 'pt',
  ID: 'id',
  IN: 'hi',
  AE: 'ar',
  SA: 'ar',
  PS: 'ar',
  EG: 'ar',
  JO: 'ar',
  LB: 'ar',
  DZ: 'ar',
  MA: 'ar',
  TN: 'ar',
  QA: 'ar',
  KW: 'ar',
  OM: 'ar',
  BH: 'ar',
  YE: 'ar',
  IQ: 'ar',
  SY: 'ar',
};

export const parseAcceptLanguage = (header: string | null): string[] => {
  if (!header) return [];
  return header
    .split(',')
    .map((part) => part.trim())
    .map((part) => {
      const [lang = '', qValue] = part.split(';q=');
      return { lang, q: qValue ? parseFloat(qValue) : 1 };
    })
    .sort((a, b) => b.q - a.q)
    .map((item) => item.lang);
};

export const normalizeLocale = (lang: string): string | null => {
  const lower = lang.toLowerCase();
  if (lower.startsWith('ko')) return 'ko';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('pt')) return 'pt';
  if (lower.startsWith('ru')) return 'ru';
  if (lower.startsWith('ar')) return 'ar';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('zh')) {
    if (lower.includes('hant') || lower.includes('tw') || lower.includes('hk') || lower.includes('mo')) {
      return 'zh-Hant';
    }
    return 'zh-Hans';
  }
  if (lower.startsWith('hi')) return 'hi';
  if (lower.startsWith('id')) return 'id';
  return null;
};

export interface LocaleResolutionInput {
  cookieLocale?: string;
  acceptLanguage?: string | null;
  country?: string;
}

export const resolveLocale = ({
  cookieLocale,
  acceptLanguage,
  country,
}: LocaleResolutionInput): string => {
  if (isSupportedLocale(cookieLocale)) return cookieLocale!;

  const accepted = parseAcceptLanguage(acceptLanguage ?? null)
    .map((lang) => normalizeLocale(lang))
    .find((lang) => lang && isSupportedLocale(lang));
  if (accepted) return accepted;

  const mapped = country ? COUNTRY_TO_LOCALE[country] : undefined;
  if (mapped && isSupportedLocale(mapped)) return mapped;

  return DEFAULT_LOCALE;
};

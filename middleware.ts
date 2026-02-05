import { NextRequest, NextResponse } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from './src/i18n/locales';

const PUBLIC_FILE = /\.(.*)$/;

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

const isSupportedLocale = (locale?: string) => !!locale && LOCALES.includes(locale as typeof LOCALES[number]);

const parseAcceptLanguage = (header: string | null): string[] => {
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

const normalizeLocale = (lang: string): string | null => {
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

const detectLocale = (request: NextRequest): string => {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (isSupportedLocale(cookieLocale)) return cookieLocale!;

  const accepted = parseAcceptLanguage(request.headers.get('accept-language'))
    .map((lang) => normalizeLocale(lang))
    .find((lang) => lang && isSupportedLocale(lang));
  if (accepted) return accepted;

  const country = request.headers.get('x-vercel-ip-country') || request.geo?.country || '';
  const mapped = COUNTRY_TO_LOCALE[country];
  if (mapped && isSupportedLocale(mapped)) return mapped;

  return DEFAULT_LOCALE;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if the current pathname already starts with a supported locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Detect the best locale for the user
  const detectedLocale = detectLocale(request);

  // Redirect to the locale-prefixed version of the path
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`;

  const response = NextResponse.redirect(url);

  // Set NEXT_LOCALE cookie to persist preference
  if (detectedLocale) {
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  // Run on all pages except static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

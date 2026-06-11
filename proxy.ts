import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, LOCALES } from './src/constants/locales';
import { resolveLocale } from './src/utils/localeDetection';

const PUBLIC_FILE = /\.(.*)$/;

const detectLocale = (request: NextRequest): string =>
  resolveLocale({
    cookieLocale: request.cookies.get('NEXT_LOCALE')?.value,
    acceptLanguage: request.headers.get('accept-language'),
    // Next 15 에서 request.geo 가 제거됨. Vercel 환경에선 'x-vercel-ip-country'
    // 헤더가 동일 정보를 제공하므로 단일 소스로 단순화.
    country: request.headers.get('x-vercel-ip-country') || '',
  });

export function proxy(request: NextRequest) {
  try {
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

    const surveyLocalePrefix = LOCALES.find(
      (locale) => pathname === `/${locale}/camps/2026/survey`
    );
    const isNonDefaultSurvey =
      (request.nextUrl.locale &&
        request.nextUrl.locale !== DEFAULT_LOCALE &&
        pathname === '/camps/2026/survey') ||
      (surveyLocalePrefix && surveyLocalePrefix !== DEFAULT_LOCALE);
    if (isNonDefaultSurvey) {
      const url = request.nextUrl.clone();
      url.locale = DEFAULT_LOCALE;
      url.pathname = '/camps/2026/survey';
      return NextResponse.redirect(url);
    }

    // Only redirect on the root path to avoid locale redirect loops on subpages.
    if (pathname !== '/') {
      return NextResponse.next();
    }

    // Detect the best locale for the user
    const detectedLocale = detectLocale(request);

    // 기본 로케일(ko)은 접두사 없이 `/`가 canonical URL이므로 리다이렉트하지 않는다.
    // 기본 로케일로 리다이렉트하면 `/ko` 경로가 생성되어 sitemap canonical과 불일치하고,
    // Googlebot이 홈페이지를 정상적으로 색인하지 못한다.
    if (detectedLocale === DEFAULT_LOCALE) {
      return NextResponse.next();
    }

    // Redirect to the locale-prefixed version of the path
    const url = request.nextUrl.clone();
    url.pathname = `/${detectedLocale}`;

    const response = NextResponse.redirect(url);

    // Set NEXT_LOCALE cookie to persist preference
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('middleware_error', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.next();
  }
}

export const config = {
  // Run on all pages except static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

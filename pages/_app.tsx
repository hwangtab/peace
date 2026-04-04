import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import reportWebVitals from '../src/reportWebVitals';
import { MotionConfig } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import nextI18NextConfig from '../next-i18next.config';
import '@/index.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ErrorFallback from '@/components/common/ErrorFallback';
import { getTextDirection } from '@/utils/rtl';

import { NavigationProvider } from '@/context/NavigationContext';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = (() => {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (id && /^G-[A-Z0-9]+$/.test(id)) return id;
  return undefined;
})();

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale } = router;
  useEffect(() => {
    const dir = getTextDirection(locale || 'ko');
    document.documentElement.setAttribute('dir', dir);
  }, [locale]);

  // Core Web Vitals → GA4 보고
  useEffect(() => {
    reportWebVitals((metric) => {
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    });
  }, []);

  // GA4 클라이언트 사이드 네비게이션 추적
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <NavigationProvider>
      {/* reducedMotion="user": OS의 prefers-reduced-motion 설정을 존중.
           모바일 CSS 애니메이션은 index.css @media (max-width: 767px)에서 별도 처리. */}
      <MotionConfig reducedMotion="user">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        {/* GA4: afterInteractive로 렌더링 차단 방지 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-config" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{page_path:window.location.pathname});`}
            </Script>
          </>
        )}

        <Navigation />
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <main id="main-content" className="overflow-x-hidden">
            <Component {...pageProps} />
          </main>
        </ErrorBoundary>
        <Footer />
      </MotionConfig>
    </NavigationProvider>
  );
}

export default appWithTranslation(App, nextI18NextConfig);

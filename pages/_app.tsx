import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import reportWebVitals from '../src/reportWebVitals';
import { LazyMotion, MotionConfig } from 'framer-motion';

// framer-motion 의 features 를 비동기 청크로 분리해 _app 첫 페인트에서 19KB 의
// projection/drag/layout 코드를 빼낸다. m.* 컴포넌트(가벼운 변형)와 짝을 이룸.
// domMax 는 layoutId(AlbumTabContent) 와 layout=true(TrackCard) 사용을 지원.
const loadDomMaxFeatures = () => import('framer-motion').then((mod) => mod.domMax);
import { ErrorBoundary } from 'react-error-boundary';
import nextI18NextConfig from '../next-i18next.config';
import '@/index.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ErrorFallback from '@/components/common/ErrorFallback';
import { NavigationProvider } from '@/context/NavigationContext';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

import { config } from '@/config/env';
const GA_MEASUREMENT_ID = config.gaMeasurementId;

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

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

  // GA4 클라이언트 사이드 네비게이션 추적 — 'page_view' event 직접 발화.
  // inline config 가 첫 페이지 view 를 보내고 (send_page_view=true 기본),
  // 이후 SPA 라우트 변경마다 여기서 page_view 만 보낸다 (gtag('config') 재호출
  // 방식은 매 호출마다 page_view 가 fire 되어 실수 시 중복 위험이 있어 회피).
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: url,
          page_location: window.location.href,
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
      <LazyMotion features={loadDomMaxFeatures} strict>
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
      </LazyMotion>
    </NavigationProvider>
  );
}

// App Router 전환 시 next-intl + createNextIntlMiddleware 로 교체 필요
export default appWithTranslation(App, nextI18NextConfig);

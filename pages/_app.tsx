import type { AppProps } from 'next/app';
import Head from 'next/head';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import nextI18NextConfig from '../next-i18next.config';
import '@/index.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { getTextDirection } from '@/utils/rtl';

import { NavigationProvider } from '@/context/NavigationContext';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale } = router;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const dir = getTextDirection(locale || 'ko');
    document.documentElement.setAttribute('dir', dir);
  }, [locale]);

  // GA4 클라이언트 사이드 네비게이션 추적
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
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
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <main id="main-content">
        <Component key={router.asPath.split('#')[0]} {...pageProps} />
      </main>
      <Footer />
    </NavigationProvider>
  );
}

export default appWithTranslation(App, nextI18NextConfig);

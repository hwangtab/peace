import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import nextI18NextConfig from '../next-i18next.config';
import '../src/index.css';
import Navigation from '../src/components/layout/Navigation';
import Footer from '../src/components/layout/Footer';

function App({ Component, pageProps }: AppProps) {
  const { locale } = useRouter();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [locale]);

  return (
    <>
      <Navigation />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default appWithTranslation(App, nextI18NextConfig);

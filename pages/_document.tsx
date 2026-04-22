import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { getTextDirection } from '@/utils/rtl';

class MyDocument extends Document {
  static override async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  override render() {
    const { locale } = this.props.__NEXT_DATA__;
    const currentLocale = locale || 'ko';
    const dir = getTextDirection(currentLocale);

      return (
        <Html lang={currentLocale} dir={dir}>
        <Head>
          {/* Google Analytics preconnect (GA4 렌더링 차단 방지) */}
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="//www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="//www.google-analytics.com" />

          {/* Body 폰트 preload (FOUT 방지) — LCP 히어로 본문에 사용 */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/GmarketSansLight.woff2"
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />

          {/* PartialSans (h1 hero 폰트) preload — LCP 폰트이므로 최우선 */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/PartialSansKR-Regular.woff2"
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />

          {/* 테마 & 색상 스킴 */}
          <meta name="theme-color" content="#0A5F8A" />
          <meta name="color-scheme" content="light" />
          <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
          <meta name="application-name" content="강정피스앤뮤직캠프" />

          {/* Favicon & PWA */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/logo192.png" />
          <link rel="manifest" href="/manifest.json" />

          {/* Sitemap 광고 (Googlebot 등이 HTML에서 직접 발견 가능) */}
          <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

          {/* Naver Search Console 인증 */}
          <meta name="naver-site-verification" content="68980c84460ca49f3268a96ad5832da513b55bca" />

          {/* YouTube DNS-prefetch (비디오 페이지 LCP 개선) */}
          <link rel="dns-prefetch" href="//www.youtube.com" />
          <link rel="dns-prefetch" href="//img.youtube.com" />
          <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />

          {/* 외부 링크 도메인 preconnect/dns-prefetch (CTA 전환 개선) */}
          <link rel="dns-prefetch" href="//tumblbug.com" />
          <link rel="preconnect" href="https://tumblbug.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="//www.instagram.com" />
          <link rel="preconnect" href="https://www.instagram.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="//smartstore.naver.com" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

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
          {/* 폰트 CDN preconnect */}
          <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />

          {/* Body 폰트 preload (FOUT 방지) */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/GmarketSansLight.woff2"
          />

          {/* PartialSans, KkuBulLim — hero/stone 전용 폰트이므로 preload 생략.
               font-display: swap이 적용되어 있어 FOUT 없이 자연스럽게 로딩됨. */}

          {/* BookkMyungjo-Bd 폰트 preload */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302@1.0/BookkMyungjo-Bd.woff2"
          />

          {/* LCP 히어로 이미지 preload */}
          <link
            rel="preload"
            as="image"
            type="image/webp"
            href="/images-webp/camps/2023/DSC00437.webp"
          />

          {/* 테마 & 색상 스킴 */}
          <meta name="theme-color" content="#0A5F8A" />
          <meta name="color-scheme" content="light" />
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

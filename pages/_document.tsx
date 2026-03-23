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
          <link rel="preconnect" href="https://fastly.jsdelivr.net" crossOrigin="anonymous" />

          {/* Body 폰트 preload (FOUT 방지) */}
          <link
            rel="preload"
            as="font"
            type="font/woff"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansLight.woff"
          />

          {/* Hero 핵심 폰트 preload */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2307-1@1.1/PartialSansKR-Regular.woff2"
          />
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/gh/projectnoonnu/2410-1@1.0/BMkkubulimTTF-Regular.woff2"
          />

          {/* LCP 히어로 이미지 preload */}
          <link
            rel="preload"
            as="image"
            href="/images-webp/camps/2023/DSC00437.webp"
          />
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

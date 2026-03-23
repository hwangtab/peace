import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { getTextDirection } from '@/utils/rtl';

const GA_MEASUREMENT_ID = (() => {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (id && /^G-[A-Z0-9]+$/.test(id)) return id;
  return undefined;
})();

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
        <Html lang={currentLocale} dir={dir} className="overflow-x-hidden">
        <Head>
          {/* Google Analytics 4 */}
          {GA_MEASUREMENT_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}

          {/* 폰트 CDN preconnect */}
          <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fastly.jsdelivr.net" crossOrigin="anonymous" />

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

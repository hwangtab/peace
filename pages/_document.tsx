import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static override async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  override render() {
    // __NEXT_DATA__ contains the locale info passed from getStaticProps
    const { locale } = this.props.__NEXT_DATA__;
    const currentLocale = locale || 'ko';
    const dir = currentLocale === 'ar' ? 'rtl' : 'ltr';

    return (
      <Html lang={currentLocale} dir={dir}>
        <Head>
          {/* SEO: Hreflang tags for all 13 supported languages */}
          <link rel="alternate" hrefLang="ko" href="https://peaceandmusic.net/ko" />
          <link rel="alternate" hrefLang="en" href="https://peaceandmusic.net/en" />
          <link rel="alternate" hrefLang="es" href="https://peaceandmusic.net/es" />
          <link rel="alternate" hrefLang="fr" href="https://peaceandmusic.net/fr" />
          <link rel="alternate" hrefLang="de" href="https://peaceandmusic.net/de" />
          <link rel="alternate" hrefLang="pt" href="https://peaceandmusic.net/pt" />
          <link rel="alternate" hrefLang="ru" href="https://peaceandmusic.net/ru" />
          <link rel="alternate" hrefLang="ar" href="https://peaceandmusic.net/ar" />
          <link rel="alternate" hrefLang="ja" href="https://peaceandmusic.net/ja" />
          <link rel="alternate" hrefLang="zh-Hans" href="https://peaceandmusic.net/zh-Hans" />
          <link rel="alternate" hrefLang="zh-Hant" href="https://peaceandmusic.net/zh-Hant" />
          <link rel="alternate" hrefLang="hi" href="https://peaceandmusic.net/hi" />
          <link rel="alternate" hrefLang="id" href="https://peaceandmusic.net/id" />
          <link rel="alternate" hrefLang="x-default" href="https://peaceandmusic.net/ko" />
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

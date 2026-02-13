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
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

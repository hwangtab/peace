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
      <Html lang={currentLocale} dir={dir} data-scroll-behavior="smooth">
        <Head>
          {/* Google Analytics preconnect (GA4 렌더링 차단 방지) */}
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="//www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="//www.google-analytics.com" />

          {/* Body 폰트 preload (FOUT 방지) — LCP 히어로 본문에 사용.
              S-Core Dream Regular(400)이 본문 기본 웨이트. */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/S-CoreDream-4Regular.subset.woff2?v=2"
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />

          {/* PartialSans (h1 hero 폰트) preload — LCP 폰트이므로 최우선 */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/PartialSansKR-Regular.subset.woff2?v=2"
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />

          {/* BookkMyungjo Bold preload — 모든 페이지 최상단 Navigation(font-serif)과
              h2(font-display)에 즉시 사용. preload 없으면 Nav에서 FOUT 발생. */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/BookkMyungjo-Bd.subset.woff2?v=2"
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />

          {/* 테마 & 색상 스킴 */}
          <meta name="theme-color" content="#0A5F8A" />
          <meta name="color-scheme" content="light" />
          <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
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
          <link rel="dns-prefetch" href="//booking.naver.com" />
          <link rel="preconnect" href="https://booking.naver.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="//www.instagram.com" />
          <link rel="preconnect" href="https://www.instagram.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="//smartstore.naver.com" />

          {/* 프로그레시브 인핸스먼트 폴백 — framer-motion(m.*) 콘텐츠는 initial 상태가
              opacity:0 으로 SSR 출력되고, 비동기 features 청크가 로드·실행되어야 노출된다.
              JS 가 꺼져 있거나(아래 noscript) 느린/불안정한 모바일 네트워크에서 청크 로드가
              실패하면 콘텐츠가 영영 안 보여 화면이 깨진 것처럼 보이는 문제를 방지한다. */}
          <noscript>
            <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
          </noscript>
          {/* JS 는 켜졌지만 framer-motion 청크가 일정 시간 내 로드되지 않으면(__motionReady
              미설정) 숨겨진 콘텐츠를 강제 노출한다. 정상 로드 시에는 아무 동작도 하지 않아
              스크롤 등장 애니메이션을 그대로 유지한다. */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "window.setTimeout(function(){if(window.__motionReady)return;var n=document.querySelectorAll('[style*=\"opacity:0\"],[style*=\"opacity: 0\"]');for(var i=0;i<n.length;i++){n[i].style.opacity='1';n[i].style.transform='none';}},3000);",
            }}
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

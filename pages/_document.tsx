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

    // 로케일별 본문 기본 폰트(LCP preload 대상). 라틴/키릴(en/es/fr/de/pt/ru/id)은
    // 공통 Noto Sans. 각 페이지는 자기 언어 폰트만 받는다(전 로케일에 한글 872KB +
    // 세리프 1.4MB 를 깔던 낭비 제거).
    const bodyFontByLocale: Record<string, string> = {
      ko: 'NotoSansKR-Regular',
      ja: 'NotoSansJP-Regular',
      'zh-Hans': 'NotoSansSC-Regular',
      'zh-Hant': 'NotoSansTC-Regular',
      hi: 'NotoSansDevanagari-Regular',
      ar: 'NotoSansArabic-Regular',
    };
    const bodyFontFile = bodyFontByLocale[currentLocale] || 'NotoSans-Regular';

    return (
      <Html lang={currentLocale} dir={dir} data-scroll-behavior="smooth">
        <Head>
          {/* Google Analytics preconnect (GA4 렌더링 차단 방지) */}
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="//www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="//www.google-analytics.com" />

          {/* 포인트 폰트(PartialSans) preload — typo-h1(홈 HeroSection·PageHero 제목 등
              LCP 텍스트 요소)이 전 로케일 전 페이지에서 즉시 사용한다. preload 가 없으면
              페이지당 1.5MB 폰트와 대역 경쟁해 늦게 도착 → h1 swap 페인트가 LCP 를 뒤로
              밀었다(모바일 Render Delay 10s). 초경량 서브셋(~103KB, font-partial 실사용
              글리프만)을 high 밴드 '첫 번째'로 두어 LCP 확정 전에 h1 을 확정한다. */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/PartialSansKR-Regular.subset.woff2?v=5"
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />

          {/* 본문 폰트 preload — 로케일별 본문 기본 폰트. 그 외 스크립트는
              해당 페이지에서 unicode-range 로 자연 로드. */}
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href={`/fonts/${bodyFontFile}.subset.woff2?v=4`}
            // @ts-expect-error — fetchpriority is a valid HTML attribute (React 18.3+)
            fetchpriority="high"
          />

          {/* 제목 세리프(Noto Serif KR Bold)는 preload 하지 않는다 — typo-h2/h3
              (섹션 제목)용이라 대부분 fold 아래이고, preload 하면 슬로우 4G 에서 LCP
              이미지·포인트 폰트의 대역폭을 선점해 LCP Load Delay 를 7~9s 로 밀었다
              (Lighthouse 실측). CSS unicode-range 매칭 시점에 자연 로드돼도 fold 아래
              제목의 swap 은 체감이 미미하다. 세리프는 2-슬라이스(core ~333KB 공개
              실사용 / rest ~224KB 잔여 음절)로 나뉘어, 공개 페이지는 core 만 로드한다. */}

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

          {/* llms.txt 광고 — LLM 크롤러가 /llms.txt 를 추측하지 않고 HTML 에서 발견 */}
          <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />

          {/* Naver Search Console 인증 */}
          <meta name="naver-site-verification" content="68980c84460ca49f3268a96ad5832da513b55bca" />

          {/* YouTube DNS-prefetch (비디오 페이지 LCP 개선) — preconnect 제거(매 페이지
              비용 대비 이득 미미), dns-prefetch 만으로 충분. */}
          <link rel="dns-prefetch" href="//www.youtube.com" />
          <link rel="dns-prefetch" href="//img.youtube.com" />

          {/* 외부 링크 도메인 — CTA 클릭 후 전환이라 preconnect 이득 미미.
              dns-prefetch(비용 거의 0) 만 유지. */}
          <link rel="dns-prefetch" href="//booking.naver.com" />
          <link rel="dns-prefetch" href="//www.instagram.com" />
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

const { i18n } = require('./next-i18next.config');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// 게시판 이미지(board-images 버킷)는 Supabase Storage 공개 URL 로 저장된다.
// 이 호스트를 next/image remotePatterns 에 등록해야 (1) <Image> 가 렌더 가능하고
// (2) Vercel 이 변환 결과를 minimumCacheTTL(30일) 동안 CDN 캐시해 Supabase Storage
// egress 를 '조회당'에서 '이미지·사이즈당 최대 월 1회'로 낮춘다(egress 쿼터 보호).
const supabaseImageHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return null;
  }
})();

// Content-Security-Policy (enforce — 차단 적용).
// 정적 생성(SSG/ISR) + 인라인 스크립트(_document 폴백·GA·JSON-LD) 구조라
// 요청별 nonce 를 줄 수 없어 script/style 은 'unsafe-inline' 을 허용한다.
// 대신 외부 출처를 화이트리스트로 묶어 데이터 유출·외부 스크립트 주입·클릭재킹을 막는다.
// 화이트리스트: GA(googletagmanager·google-analytics), Supabase(*.supabase.co —
// 백서·게시판 + KOSMART 설문), YouTube(영상 임베드·썸네일).
// dev 는 webpack HMR 이 unsafe-eval 을 써 위반 노이즈가 심하므로 production 만 적용.
// Report-Only 단계에서 홈·갤러리·영상·게시판·press + YouTube iframe 직접 삽입까지
// production 빌드로 검증해 실제 차단 위반 0건을 확인한 뒤 enforce 로 전환함.

// press 썸네일은 언론사 원본 이미지를 외부 도메인에서 직접 로드한다(unoptimized).
// 출처가 매체마다 달라 img-src 화이트리스트에 등록해야 차단되지 않는다.
// 매체 자체 도메인은 서브도메인 변동(img→img2 등)에 견디도록 등록도메인 와일드카드,
// 공유 CDN(speedgabia·daumcdn)은 범위를 좁히려 정확 호스트로 둔다.
// 새 매체 기사를 추가할 때 새 호스트가 생기면 여기에 더해야 한다.
const PRESS_IMG_HOSTS = [
  'https://*.news-art.co.kr',
  'https://*.hani.co.kr',
  'https://*.khan.co.kr',
  'https://*.headlinejeju.co.kr',
  'https://*.ruliweb.com',
  'https://*.mt.co.kr',
  'https://*.ijejutoday.com',
  'https://*.newsnjeju.com',
  'https://*.woman-story.co.kr',
  'https://*.lawyersite.co.kr',
  'https://mmagimg.speedgabia.com',
  'https://img1.daumcdn.net',
].join(' ');

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://*.supabase.co ${PRESS_IMG_HOSTS}`,
  "font-src 'self'",
  "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.supabase.co",
  'frame-src https://www.youtube.com',
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

const cspHeader =
  process.env.NODE_ENV === 'production'
    ? [{ key: 'Content-Security-Policy', value: CSP_DIRECTIVES }]
    : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  i18n: {
    ...i18n,
    localeDetection: false, // 커스텀 미들웨어와 충돌을 방지하기 위해 내장 감지 기능 비활성화
  },
  // react-icons 의 fa/hi/io5 인덱스 전체를 불러오는 barrel import 를 트리 흔들기 가능하도록
  // 개별 아이콘 경로로 자동 변환 (번들 분석에서 _app.js 에 fa+io5 만 ~22KiB 차지하던 회귀 해소).
  modularizeImports: {
    'react-icons/?(((\\w*)?/?)*)': {
      transform: 'react-icons/{{ matches.[1] }}/{{member}}',
      skipDefaultConversion: true,
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Next 16 부터 images.qualities 기본값이 [75] 라 quality prop 의 다른 값이
    // findClosestQuality 에 의해 75 로 강제 변환됨. 우리가 사용하는 모든 quality
    // 값을 명시적으로 등록해야 그대로 적용된다.
    qualities: [55, 60, 65, 75],
    // /_next/image 의 변환 결과를 한 달 캐시 (기본 4시간 → 30일). 정적 이미지가
    // 변하지 않으므로 cold-cache miss 비율을 낮춰 LCP 이미지 fetch 지연 감소.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
      // 게시판 이미지: 공개 스토리지 오브젝트만 허용(공개 경로로 범위 제한).
      ...(supabaseImageHost
        ? [
            {
              protocol: 'https',
              hostname: supabaseImageHost,
              pathname: '/storage/v1/object/public/**',
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...cspHeader,
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images-webp/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/audio/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // /data/*.json (gallery, musicians, tracks, videos, press) — 콘텐츠
        // 변경 시 빌드 ID 갱신으로 자연 무효화. SPA 페이지 이동 시 재페치 제거.
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=31536000',
          },
        ],
      },
      {
        // /locales/*/*.json — i18next 가 클라이언트 런타임에 fetch.
        // 동일 메커니즘으로 SPA 이동 시 재페치 제거.
        source: '/locales/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=31536000',
          },
        ],
      },
    ];
  },
  async redirects() {
    // www → non-www 리다이렉트는 Vercel Domains 의 'Connect to an environment'
    // 로 양 도메인이 동일 콘텐츠 직접 서빙 (302/308 round-trip 제거). canonical
    // <link> 가 검색엔진에 primary 도메인을 알려주므로 SEO 영향 없음.
    return [
      {
        source: '/musicians',
        destination: '/album/musicians',
        permanent: true,
      },
      {
        source: '/tracks',
        destination: '/album/tracks',
        permanent: true,
      },
      {
        source: '/camps',
        destination: '/camps/2026',
        permanent: false,
      },
      {
        source: '/album',
        destination: '/album/about',
        permanent: true,
      },
    ];
  },
  // Polyfill module 은 patches/next+16.2.6.patch 로 빈 파일로 패치됨
  // (postinstall: patch-package 가 자동 적용). browserslist baseline-modern
  // 에서 모두 네이티브 지원되어 1.4KB 인라인 불필요.
};

module.exports = withBundleAnalyzer(nextConfig);

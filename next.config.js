const { i18n } = require('./next-i18next.config');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
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
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images-webp/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/audio/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
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
  // Polyfill module 은 patches/next+16.2.4.patch 로 빈 파일로 패치됨
  // (postinstall: patch-package 가 자동 적용). browserslist baseline-modern
  // 에서 모두 네이티브 지원되어 1.4KB 인라인 불필요.
};

module.exports = withBundleAnalyzer(nextConfig);

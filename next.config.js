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
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.peaceandmusic.net' }],
        destination: 'https://peaceandmusic.net/:path*',
        permanent: true,
      },
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
  // Next 16 은 Turbopack 이 기본. 14.x 시절 webpack alias 로 빈 모듈 대체했던
  // next/dist/build/polyfills/polyfill-module (Array.at 등 1.4KB 인라인) 은
  // Turbopack 의 resolveAlias 가 next 내부 경로에 적용되지 않아 그대로 인라인됨.
  // 영향 미미하므로 향후 Turbopack alias API 가 nested next/* 패턴을 지원하면
  // 다시 해당 alias 추가 (scripts/empty-polyfill.js 는 보존).
  turbopack: {},
};

module.exports = withBundleAnalyzer(nextConfig);

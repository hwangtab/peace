const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    ...i18n,
    localeDetection: false, // 커스텀 미들웨어와 충돌을 방지하기 위해 내장 감지 기능 비활성화
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async redirects() {
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
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

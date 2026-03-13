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
      { protocol: 'https', hostname: 'www.news-art.co.kr' },
      { protocol: 'https', hostname: 'flexible.img.hani.co.kr' },
      { protocol: 'https', hostname: 'img.khan.co.kr' },
      { protocol: 'https', hostname: 'images.khan.co.kr' },
      { protocol: 'https', hostname: 'mmagimg.speedgabia.com' },
      { protocol: 'https', hostname: 'www.headlinejeju.co.kr' },
      { protocol: 'https', hostname: 'news.mt.co.kr' },
      { protocol: 'https', hostname: 'thumb.mt.co.kr' },
      { protocol: 'https', hostname: 'i3.ruliweb.com' },
      { protocol: 'https', hostname: 'cdn.ijejutoday.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'www.newsnjeju.com' },
      { protocol: 'http', hostname: 'www.newsnjeju.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'cdn.thescoop.co.kr' },
      { protocol: 'https', hostname: 'image.bugsm.co.kr' },
      { protocol: 'https', hostname: 'i.namu.wiki' },
      { protocol: 'https', hostname: 'kprofiles.com' },
      { protocol: 'https', hostname: 'street-h.com' },
      { protocol: 'https', hostname: 'image.genie.co.kr' },
      { protocol: 'https', hostname: 'ojsfile.ohmynews.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'img.koreatimes.co.kr' },
      { protocol: 'https', hostname: 'theplay.or.kr' },
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

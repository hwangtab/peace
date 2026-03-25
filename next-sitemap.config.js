/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://peaceandmusic.net',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  alternateRefs: [
    { href: 'https://peaceandmusic.net', hreflang: 'ko' },
    { href: 'https://peaceandmusic.net/en', hreflang: 'en' },
    { href: 'https://peaceandmusic.net/es', hreflang: 'es' },
    { href: 'https://peaceandmusic.net/fr', hreflang: 'fr' },
    { href: 'https://peaceandmusic.net/de', hreflang: 'de' },
    { href: 'https://peaceandmusic.net/pt', hreflang: 'pt' },
    { href: 'https://peaceandmusic.net/ru', hreflang: 'ru' },
    { href: 'https://peaceandmusic.net/ar', hreflang: 'ar' },
    { href: 'https://peaceandmusic.net/ja', hreflang: 'ja' },
    { href: 'https://peaceandmusic.net/zh-Hans', hreflang: 'zh-Hans' },
    { href: 'https://peaceandmusic.net/zh-Hant', hreflang: 'zh-Hant' },
    { href: 'https://peaceandmusic.net/hi', hreflang: 'hi' },
    { href: 'https://peaceandmusic.net/id', hreflang: 'id' },
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'Yandex', allow: '/' },
      { userAgent: 'Yeti', allow: '/' },
      { userAgent: '*', allow: '/' },
    ],
  },
  transform: async (config, path) => {
    // Camp 2026 pages get higher priority
    if (path === '/camps/2026') {
      return { loc: path, changefreq: 'weekly', priority: 0.9, lastmod: new Date().toISOString() };
    }
    if (path.startsWith('/camps/2026/musicians/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.7, lastmod: new Date().toISOString() };
    }
    // Home page
    if (path === '/') {
      return { loc: path, changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString() };
    }
    // Default
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};

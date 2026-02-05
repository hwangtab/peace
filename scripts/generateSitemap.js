const fs = require('fs');
const path = require('path');

const locales = [
  'ko',
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'ru',
  'ar',
  'ja',
  'zh-Hans',
  'zh-Hant',
  'hi',
  'id',
];

// 웹사이트의 모든 페이지 경로
const pages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/gallery', changefreq: 'weekly', priority: '0.7' },
  { path: '/press', changefreq: 'weekly', priority: '0.7' },
  { path: '/videos', changefreq: 'weekly', priority: '0.7' },
  { path: '/camps/2023', changefreq: 'yearly', priority: '0.8' },
  { path: '/camps/2025', changefreq: 'yearly', priority: '0.8' },
  { path: '/camps/2026', changefreq: 'monthly', priority: '0.9' },
  { path: '/album/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/album/musicians', changefreq: 'monthly', priority: '0.7' },
  { path: '/album/tracks', changefreq: 'monthly', priority: '0.7' },
];

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const generateSitemap = () => {
  const baseUrl = 'https://peaceandmusic.net';
  const lastmod = getCurrentDate();

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  locales.forEach((locale) => {
    pages.forEach((page) => {
      const localePath = page.path === '/' ? `/${locale}` : `/${locale}${page.path}`;
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${localePath}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });
  });

  sitemap += '</urlset>\n';

  return sitemap;
};

const saveSitemap = () => {
  try {
    const sitemapContent = generateSitemap();
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

    fs.writeFileSync(outputPath, sitemapContent, 'utf8');
    console.log('✅ sitemap.xml이 성공적으로 생성되었습니다!');
    console.log('   위치:', outputPath);
    console.log('   페이지 수:', pages.length * locales.length);
    console.log('   생성 날짜:', getCurrentDate());
  } catch (error) {
    console.error('❌ sitemap.xml 생성 중 오류 발생:', error);
    process.exit(1);
  }
};

saveSitemap();

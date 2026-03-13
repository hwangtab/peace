const fs = require('fs');
const path = require('path');

const DEFAULT_LOCALE = 'ko';

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

// 웹사이트의 모든 정적 페이지 경로
const staticPages = [
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

// 동적 페이지를 위한 데이터 로드
const loadJsonArray = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
};

const getDynamicPages = () => {
  const dataRoot = path.join(__dirname, '..', 'public', 'data');
  const dynamicPages = [];

  // 뮤지션 개별 페이지
  const musicians = loadJsonArray(path.join(dataRoot, 'musicians.json'));
  musicians.forEach((m) => {
    dynamicPages.push({
      path: `/album/musicians/${m.id}`,
      changefreq: 'monthly',
      priority: '0.6',
    });
  });

  // 트랙 개별 페이지
  const tracks = loadJsonArray(path.join(dataRoot, 'tracks.json'));
  tracks.forEach((t) => {
    dynamicPages.push({
      path: `/album/tracks/${t.id}`,
      changefreq: 'monthly',
      priority: '0.6',
    });
  });

  return dynamicPages;
};

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const baseUrl = 'https://peaceandmusic.net';

// 로케일에 따른 URL 경로 생성 (기본 로케일은 prefix 없음)
const getLocalePath = (pagePath, locale) => {
  if (locale === DEFAULT_LOCALE) {
    return pagePath === '/' ? '' : pagePath;
  }
  return pagePath === '/' ? `/${locale}` : `/${locale}${pagePath}`;
};

// 각 URL에 대한 hreflang alternate 링크 생성
const getAlternateLinks = (pagePath) => {
  let links = '';
  locales.forEach((locale) => {
    const href = `${baseUrl}${getLocalePath(pagePath, locale)}`;
    const hreflang = locale;
    links += `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />\n`;
  });
  // x-default는 기본 로케일(ko) URL로 설정
  const defaultHref = `${baseUrl}${getLocalePath(pagePath, DEFAULT_LOCALE)}`;
  links += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />\n`;
  return links;
};

const generateSitemap = () => {
  const lastmod = getCurrentDate();
  const allPages = [...staticPages, ...getDynamicPages()];

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  locales.forEach((locale) => {
    allPages.forEach((page) => {
      const loc = `${baseUrl}${getLocalePath(page.path, locale)}`;
      sitemap += '  <url>\n';
      sitemap += `    <loc>${loc}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += getAlternateLinks(page.path);
      sitemap += '  </url>\n';
    });
  });

  sitemap += '</urlset>\n';

  return sitemap;
};

const saveSitemap = () => {
  try {
    const dynamicPages = getDynamicPages();
    const totalPages = staticPages.length + dynamicPages.length;
    const sitemapContent = generateSitemap();
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

    fs.writeFileSync(outputPath, sitemapContent, 'utf8');
    console.log('✅ sitemap.xml이 성공적으로 생성되었습니다!');
    console.log('   위치:', outputPath);
    console.log(`   정적 페이지: ${staticPages.length}, 동적 페이지: ${dynamicPages.length}`);
    console.log(`   총 URL 수: ${totalPages * locales.length} (${totalPages} pages x ${locales.length} locales)`);
    console.log('   생성 날짜:', getCurrentDate());
  } catch (error) {
    console.error('❌ sitemap.xml 생성 중 오류 발생:', error);
    process.exit(1);
  }
};

saveSitemap();

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { i18n } = require('./next-i18next.config');

const siteUrl = 'https://peaceandmusic.net';

// 관리자·인증 표면: 사이트맵 제외 + robots disallow 공통 소스.
// 기본 경로와 로케일 프리픽스(/en/admin 등) 변형을 함께 차단한다.
const AUTH_BASE_PATHS = [
  '/admin',
  '/login',
  '/signup',
  '/account',
  '/reset-password',
  '/update-password',
];
// 사이트맵 exclude용 glob: 기본·하위·로케일 변형 모두 포함
const AUTH_EXCLUDE = AUTH_BASE_PATHS.flatMap((p) => [p, `${p}/**`, `/*${p}`, `/*${p}/**`]);
// robots disallow용: 디렉터리 전체 차단(하위 경로 포함). 로케일 프리픽스는
// 봇이 prefix 매칭하므로 기본 경로만으로 충분하나 명시적으로 와일드카드도 추가.
const AUTH_DISALLOW = AUTH_BASE_PATHS.flatMap((p) => [p, `/*${p}`]);

// hreflang 오버라이드(SEOHelmet과 동일): 스크립트 서브태그 → BCP47 지역 코드
const HREFLANG_OVERRIDE = { 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW' };

const locales = i18n.locales;
const defaultLocale = i18n.defaultLocale;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'public', 'data');
const localeDir = path.join(rootDir, 'public', 'locales');
const gitLastmodCache = new Map();

const getExistingFiles = (filePaths) => filePaths.filter((filePath) => fs.existsSync(filePath));

const getLocalizedDataFiles = (name) =>
  getExistingFiles([
    path.join(dataDir, `${name}.json`),
    ...locales.map((locale) => path.join(dataDir, locale, `${name}.json`)),
  ]);

const getGalleryFiles = () => {
  const galleryDir = path.join(dataDir, 'gallery');
  if (!fs.existsSync(galleryDir)) return [];
  return fs.readdirSync(galleryDir).map((fileName) => path.join(galleryDir, fileName));
};

const getTranslationFiles = () =>
  getExistingFiles(locales.map((locale) => path.join(localeDir, locale, 'translation.json')));

const toIsoString = (mtimeMs) => new Date(mtimeMs).toISOString();

const getLatestMtime = (filePaths) => {
  const existingFiles = getExistingFiles(filePaths);
  if (existingFiles.length === 0) return undefined;

  return toIsoString(Math.max(...existingFiles.map((filePath) => fs.statSync(filePath).mtimeMs)));
};

const getGitLastmod = (filePaths) => {
  const existingFiles = getExistingFiles(filePaths);
  if (existingFiles.length === 0) return undefined;

  const cacheKey = existingFiles.slice().sort().join('|');
  if (gitLastmodCache.has(cacheKey)) {
    return gitLastmodCache.get(cacheKey);
  }

  try {
    const relativeFiles = existingFiles.map((filePath) => path.relative(rootDir, filePath));
    const gitLastmod = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...relativeFiles], {
      cwd: rootDir,
      encoding: 'utf8',
    }).trim();

    const result = gitLastmod || undefined;
    gitLastmodCache.set(cacheKey, result);
    return result;
  } catch {
    gitLastmodCache.set(cacheKey, undefined);
    return undefined;
  }
};

const getLastmod = (filePaths) => getGitLastmod(filePaths) || getLatestMtime(filePaths);

const stripLocalePrefix = (pagePath) => {
  const sortedLocales = [...locales].sort((a, b) => b.length - a.length);

  for (const locale of sortedLocales) {
    if (pagePath === `/${locale}`) return '/';
    if (pagePath.startsWith(`/${locale}/`)) {
      return pagePath.slice(locale.length + 1);
    }
  }

  return pagePath;
};

const getLocalePath = (pagePath, locale) => {
  if (locale === defaultLocale) {
    return pagePath === '/' ? '' : pagePath;
  }

  return pagePath === '/' ? `/${locale}` : `/${locale}${pagePath}`;
};

const buildAlternateRefs = (pagePath) => {
  const normalizedPath = stripLocalePrefix(pagePath);

  return [
    ...locales.map((locale) => ({
      hreflang: HREFLANG_OVERRIDE[locale] ?? locale,
      href: `${siteUrl}${getLocalePath(normalizedPath, locale)}`,
      hrefIsAbsolute: true,
    })),
    {
      hreflang: 'x-default',
      href: `${siteUrl}${getLocalePath(normalizedPath, defaultLocale)}`,
      hrefIsAbsolute: true,
    },
  ];
};

const getLastmodForPath = (pagePath) => {
  const normalizedPath = stripLocalePrefix(pagePath);
  const translationFiles = getTranslationFiles();

  if (normalizedPath === '/') {
    return getLastmod([
      path.join(rootDir, 'src', 'data', 'timeline.ts'),
      path.join(rootDir, 'src', 'data', 'camps.ts'),
      ...translationFiles,
      ...getLocalizedDataFiles('musicians'),
      ...getLocalizedDataFiles('tracks'),
      ...getLocalizedDataFiles('videos'),
      ...getGalleryFiles(),
    ]);
  }

  if (normalizedPath === '/gallery') {
    return getLastmod([...translationFiles, ...getGalleryFiles()]);
  }

  if (normalizedPath === '/press') {
    return getLastmod([...translationFiles, ...getLocalizedDataFiles('press')]);
  }

  if (normalizedPath === '/solidarity' || normalizedPath.startsWith('/solidarity/')) {
    return getLastmod([
      path.join(rootDir, 'src', 'data', 'solidarity.ts'),
      ...translationFiles,
      ...getLocalizedDataFiles('musicians'),
    ]);
  }

  if (normalizedPath === '/videos' || normalizedPath.startsWith('/videos/')) {
    return getLastmod([...translationFiles, ...getLocalizedDataFiles('videos')]);
  }

  if (normalizedPath === '/album/about') {
    return getLastmod([
      path.join(rootDir, 'src', 'pages', 'album', 'AlbumAboutPage.tsx'),
      ...translationFiles,
    ]);
  }

  if (normalizedPath === '/album/musicians' || normalizedPath.startsWith('/album/musicians/')) {
    return getLastmod([
      path.join(rootDir, 'src', 'pages', 'album', 'AlbumMusiciansPage.tsx'),
      path.join(rootDir, 'src', 'pages', 'CampDetailPage.tsx'),
      ...translationFiles,
      ...getLocalizedDataFiles('musicians'),
    ]);
  }

  if (normalizedPath === '/album/tracks' || normalizedPath.startsWith('/album/tracks/')) {
    return getLastmod([
      path.join(rootDir, 'src', 'pages', 'album', 'AlbumTracksPage.tsx'),
      ...translationFiles,
      ...getLocalizedDataFiles('tracks'),
    ]);
  }

  if (normalizedPath === '/camps/2023') {
    return getLastmod([
      path.join(rootDir, 'src', 'data', 'camps.ts'),
      path.join(rootDir, 'src', 'pages', 'Camp2023Page.tsx'),
      ...translationFiles,
      path.join(dataDir, 'gallery', 'camp2023.json'),
    ]);
  }

  if (normalizedPath === '/camps/2025') {
    return getLastmod([
      path.join(rootDir, 'src', 'data', 'camps.ts'),
      path.join(rootDir, 'src', 'pages', 'Camp2025Page.tsx'),
      ...translationFiles,
      path.join(dataDir, 'gallery', 'camp2025.json'),
    ]);
  }

  if (normalizedPath === '/camps/2026' || normalizedPath.startsWith('/camps/2026/musicians/')) {
    return getLastmod([
      path.join(rootDir, 'src', 'data', 'camps.ts'),
      path.join(rootDir, 'src', 'pages', 'Camp2026Page.tsx'),
      path.join(rootDir, 'src', 'pages', 'CampDetailPage.tsx'),
      ...translationFiles,
      path.join(dataDir, 'gallery', 'camp2026.json'),
      ...getLocalizedDataFiles('musicians'),
    ]);
  }

  return undefined;
};

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  autoLastmod: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  // /camps/2026/guide(뮤지션), /camps/2026/staff(스태프), /camps/2026/survey(설문)
  // — 전용 비공개 안내/입력 표면(검색 차단). 사이트맵 제외.
  // admin/* 및 인증 표면(login·signup·account 등) — 비공개 관리/계정 화면.
  // 검색엔진에 노출되면 안 되므로 사이트맵 제외 + robots disallow(아래) 동시 적용.
  exclude: [
    '/404',
    '/*/404',
    '/image-sitemap.xml',
    '/video-sitemap.xml',
    '/camps/2026/guide',
    '/*/camps/2026/guide',
    '/camps/2026/staff',
    '/*/camps/2026/staff',
    '/camps/2026/survey',
    '/*/camps/2026/survey',
    // 뮤지션용 SNS 홍보 키트 — 내부 배포용, 검색 비노출
    '/camps/2026/promote',
    '/*/camps/2026/promote',
    ...AUTH_EXCLUDE,
  ],
  additionalSitemaps: [`${siteUrl}/image-sitemap.xml`, `${siteUrl}/video-sitemap.xml`],
  robotsTxtOptions: {
    additionalSitemaps: [`${siteUrl}/image-sitemap.xml`, `${siteUrl}/video-sitemap.xml`],
    policies: [
      { userAgent: 'Googlebot', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'Bingbot', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'Yandex', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'Yeti', allow: '/', disallow: AUTH_DISALLOW },
      // AI crawlers
      { userAgent: 'GPTBot', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'Google-Extended', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'CCBot', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'anthropic-ai', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'ClaudeBot', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'PerplexityBot', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: 'Bytespider', allow: '/', disallow: AUTH_DISALLOW },
      { userAgent: '*', allow: '/', disallow: AUTH_DISALLOW },
    ],
  },
  transform: async (config, path) => {
    const normalizedPath = stripLocalePrefix(path);
    const lastmod = getLastmodForPath(path);
    const alternateRefs = buildAlternateRefs(path);

    // Camp 2026 pages get higher priority
    if (normalizedPath === '/camps/2026') {
      return { loc: path, changefreq: 'weekly', priority: 0.9, lastmod, alternateRefs };
    }
    if (normalizedPath.startsWith('/camps/2026/musicians/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.7, lastmod, alternateRefs };
    }
    // Historical camp musician pages — evergreen content
    if (
      normalizedPath.startsWith('/camps/2023/musicians/') ||
      normalizedPath.startsWith('/camps/2025/musicians/')
    ) {
      return { loc: path, changefreq: 'yearly', priority: 0.6, lastmod, alternateRefs };
    }
    // Home page
    if (normalizedPath === '/') {
      return { loc: path, changefreq: 'weekly', priority: 1.0, lastmod, alternateRefs };
    }
    // Gallery — 시각적 콘텐츠 허브
    if (normalizedPath === '/gallery') {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod, alternateRefs };
    }
    // Videos — 동영상 콘텐츠 허브
    if (normalizedPath === '/videos') {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod, alternateRefs };
    }
    // Individual video detail pages — each gets its own URL for proper video indexing
    if (normalizedPath.startsWith('/videos/')) {
      return { loc: path, changefreq: 'yearly', priority: 0.7, lastmod, alternateRefs };
    }
    // Solidarity — 연대공연 목록
    if (normalizedPath === '/solidarity') {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod, alternateRefs };
    }
    // Individual solidarity event pages — 행사별 독립 페이지
    if (normalizedPath.startsWith('/solidarity/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.75, lastmod, alternateRefs };
    }
    // Press — 언론 보도
    if (normalizedPath === '/press') {
      return { loc: path, changefreq: 'monthly', priority: 0.75, lastmod, alternateRefs };
    }
    // Album about page — high-value evergreen content
    if (normalizedPath === '/album/about') {
      return { loc: path, changefreq: 'monthly', priority: 0.85, lastmod, alternateRefs };
    }
    // Album musicians list
    if (normalizedPath === '/album/musicians') {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod, alternateRefs };
    }
    // Individual album musician pages
    if (normalizedPath.startsWith('/album/musicians/')) {
      return { loc: path, changefreq: 'yearly', priority: 0.7, lastmod, alternateRefs };
    }
    // Album tracks list
    if (normalizedPath === '/album/tracks') {
      return { loc: path, changefreq: 'monthly', priority: 0.75, lastmod, alternateRefs };
    }
    // Individual track pages
    if (normalizedPath.startsWith('/album/tracks/')) {
      return { loc: path, changefreq: 'yearly', priority: 0.65, lastmod, alternateRefs };
    }
    // Historical camps
    if (normalizedPath === '/camps/2025') {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod, alternateRefs };
    }
    if (normalizedPath === '/camps/2023') {
      return { loc: path, changefreq: 'yearly', priority: 0.7, lastmod, alternateRefs };
    }
    // Default
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod,
      alternateRefs,
    };
  },
};

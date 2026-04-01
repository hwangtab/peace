const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { i18n } = require('./next-i18next.config');

const siteUrl = 'https://peaceandmusic.net';
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
  getExistingFiles(
    locales.map((locale) => path.join(localeDir, locale, 'translation.json')),
  );

const toIsoString = (mtimeMs) => new Date(mtimeMs).toISOString();

const getLatestMtime = (filePaths) => {
  const existingFiles = getExistingFiles(filePaths);
  if (existingFiles.length === 0) return undefined;

  return toIsoString(
    Math.max(...existingFiles.map((filePath) => fs.statSync(filePath).mtimeMs)),
  );
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
    const gitLastmod = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', ...relativeFiles],
      { cwd: rootDir, encoding: 'utf8' },
    ).trim();

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
    return pagePath === '/' ? '/' : pagePath;
  }

  return pagePath === '/' ? `/${locale}` : `/${locale}${pagePath}`;
};

const buildAlternateRefs = (pagePath) => {
  const normalizedPath = stripLocalePrefix(pagePath);

  return [
    ...locales.map((locale) => ({
      hreflang: locale,
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
    return getLastmod([
      ...translationFiles,
      ...getGalleryFiles(),
    ]);
  }

  if (normalizedPath === '/press') {
    return getLastmod([
      ...translationFiles,
      ...getLocalizedDataFiles('press'),
    ]);
  }

  if (normalizedPath === '/videos') {
    return getLastmod([
      ...translationFiles,
      ...getLocalizedDataFiles('videos'),
    ]);
  }

  if (normalizedPath === '/album/about') {
    return getLastmod([
      path.join(rootDir, 'src', 'pages', 'album', 'AlbumAboutPage.tsx'),
      ...translationFiles,
    ]);
  }

  if (
    normalizedPath === '/album/musicians' ||
    normalizedPath.startsWith('/album/musicians/')
  ) {
    return getLastmod([
      path.join(rootDir, 'src', 'pages', 'album', 'AlbumMusiciansPage.tsx'),
      path.join(rootDir, 'src', 'pages', 'CampDetailPage.tsx'),
      ...translationFiles,
      ...getLocalizedDataFiles('musicians'),
    ]);
  }

  if (
    normalizedPath === '/album/tracks' ||
    normalizedPath.startsWith('/album/tracks/')
  ) {
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

  if (
    normalizedPath === '/camps/2026' ||
    normalizedPath.startsWith('/camps/2026/musicians/')
  ) {
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
  exclude: ['/404', '/*/404'],
  robotsTxtOptions: {
    policies: [
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'Yandex', allow: '/' },
      { userAgent: 'Yeti', allow: '/' },
      // AI crawlers
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: '*', allow: '/' },
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
    // Home page
    if (normalizedPath === '/') {
      return { loc: path, changefreq: 'weekly', priority: 1.0, lastmod, alternateRefs };
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

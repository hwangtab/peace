const fs = require('fs');
const path = require('path');
const { i18n } = require('./next-i18next.config');

const siteUrl = 'https://peaceandmusic.net';
const locales = i18n.locales;
const defaultLocale = i18n.defaultLocale;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'public', 'data');

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

const toIsoString = (mtimeMs) => new Date(mtimeMs).toISOString();

const getLatestMtime = (filePaths) => {
  const existingFiles = getExistingFiles(filePaths);
  if (existingFiles.length === 0) return undefined;

  return toIsoString(
    Math.max(...existingFiles.map((filePath) => fs.statSync(filePath).mtimeMs)),
  );
};

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

  if (normalizedPath === '/') {
    return getLatestMtime([
      path.join(rootDir, 'src', 'data', 'timeline.ts'),
      path.join(rootDir, 'src', 'data', 'camps.ts'),
      ...getLocalizedDataFiles('musicians'),
      ...getLocalizedDataFiles('tracks'),
      ...getLocalizedDataFiles('videos'),
      ...getGalleryFiles(),
    ]);
  }

  if (normalizedPath === '/gallery') {
    return getLatestMtime(getGalleryFiles());
  }

  if (normalizedPath === '/press') {
    return getLatestMtime(getLocalizedDataFiles('press'));
  }

  if (normalizedPath === '/videos') {
    return getLatestMtime(getLocalizedDataFiles('videos'));
  }

  if (normalizedPath === '/album/about') {
    return getLatestMtime([
      path.join(rootDir, 'src', 'pages', 'album', 'AlbumAboutPage.tsx'),
    ]);
  }

  if (
    normalizedPath === '/album/musicians' ||
    normalizedPath.startsWith('/album/musicians/')
  ) {
    return getLatestMtime([
      path.join(rootDir, 'src', 'pages', 'album', 'AlbumMusiciansPage.tsx'),
      path.join(rootDir, 'src', 'pages', 'CampDetailPage.tsx'),
      ...getLocalizedDataFiles('musicians'),
    ]);
  }

  if (
    normalizedPath === '/album/tracks' ||
    normalizedPath.startsWith('/album/tracks/')
  ) {
    return getLatestMtime([
      path.join(rootDir, 'src', 'pages', 'album', 'AlbumTracksPage.tsx'),
      ...getLocalizedDataFiles('tracks'),
    ]);
  }

  if (normalizedPath === '/camps/2023') {
    return getLatestMtime([
      path.join(rootDir, 'src', 'data', 'camps.ts'),
      path.join(rootDir, 'src', 'pages', 'Camp2023Page.tsx'),
      path.join(dataDir, 'gallery', 'camp2023.json'),
    ]);
  }

  if (normalizedPath === '/camps/2025') {
    return getLatestMtime([
      path.join(rootDir, 'src', 'data', 'camps.ts'),
      path.join(rootDir, 'src', 'pages', 'Camp2025Page.tsx'),
      path.join(dataDir, 'gallery', 'camp2025.json'),
    ]);
  }

  if (
    normalizedPath === '/camps/2026' ||
    normalizedPath.startsWith('/camps/2026/musicians/')
  ) {
    return getLatestMtime([
      path.join(rootDir, 'src', 'data', 'camps.ts'),
      path.join(rootDir, 'src', 'pages', 'Camp2026Page.tsx'),
      path.join(rootDir, 'src', 'pages', 'CampDetailPage.tsx'),
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
    const lastmod = getLastmodForPath(path);
    const alternateRefs = buildAlternateRefs(path);

    // Camp 2026 pages get higher priority
    if (path === '/camps/2026') {
      return { loc: path, changefreq: 'weekly', priority: 0.9, lastmod, alternateRefs };
    }
    if (path.startsWith('/camps/2026/musicians/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.7, lastmod, alternateRefs };
    }
    // Home page
    if (path === '/') {
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

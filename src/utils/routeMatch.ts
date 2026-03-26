interface MatchRouteOptions {
  exact?: boolean;
  locale?: string;
}

const stripQueryAndHash = (path: string): string => path.split('#')[0]?.split('?')[0] ?? path;

const trimTrailingSlash = (path: string): string => {
  if (path === '/') {
    return '/';
  }

  return path.endsWith('/') ? path.slice(0, -1) : path;
};

const removeLocalePrefix = (path: string, locale?: string): string => {
  if (!locale) {
    return path;
  }

  if (path === `/${locale}`) {
    return '/';
  }

  const localePrefix = `/${locale}/`;
  if (path.startsWith(localePrefix)) {
    return `/${path.slice(localePrefix.length)}`;
  }

  return path;
};

export const normalizeRoutePath = (path: string, locale?: string): string => {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const stripped = stripQueryAndHash(withLeadingSlash);
  const withoutLocale = removeLocalePrefix(stripped, locale);
  return trimTrailingSlash(withoutLocale);
};

export const isRouteActive = (
  currentPath: string,
  targetPath: string,
  options?: MatchRouteOptions
): boolean => {
  const normalizedCurrent = normalizeRoutePath(currentPath, options?.locale);
  const normalizedTarget = normalizeRoutePath(targetPath);

  if (options?.exact || normalizedTarget === '/') {
    return normalizedCurrent === normalizedTarget;
  }

  return (
    normalizedCurrent === normalizedTarget || normalizedCurrent.startsWith(`${normalizedTarget}/`)
  );
};

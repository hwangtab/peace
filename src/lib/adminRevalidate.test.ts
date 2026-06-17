import { getArchiveRevalidationPaths } from './adminRevalidate';
import { LOCALES, DEFAULT_LOCALE } from '@/constants/locales';

const localizedPath = (path: string, locale: string) =>
  locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;

test('builds locale-aware revalidation paths for video archive changes', () => {
  const paths = getArchiveRevalidationPaths('videos', { public_id: 42 });

  for (const locale of LOCALES) {
    expect(paths).toContain(localizedPath('/videos', locale));
    expect(paths).toContain(localizedPath('/videos/42', locale));
  }
  expect(paths).toContain('/video-sitemap.xml');
});

test('builds content revalidation paths from the edited route', () => {
  const paths = getArchiveRevalidationPaths('content', { route_path: '/press' });

  expect(paths).toEqual(LOCALES.map((locale) => localizedPath('/press', locale)));
});

import { isRouteActive, normalizeRoutePath } from './routeMatch';

describe('routeMatch', () => {
  test('normalizes locale prefixes and query/hash suffixes', () => {
    expect(normalizeRoutePath('/en/album/musicians/1?tab=info#top', 'en')).toBe(
      '/album/musicians/1'
    );
  });

  test('matches dynamic detail path to parent section route', () => {
    expect(isRouteActive('/album/musicians/1', '/album/musicians')).toBe(true);
    expect(isRouteActive('/camps/2026/musicians/14', '/camps/2026')).toBe(true);
  });

  test('keeps home route exact-only by default', () => {
    expect(isRouteActive('/album/about', '/')).toBe(false);
    expect(isRouteActive('/', '/', { exact: true })).toBe(true);
  });
});

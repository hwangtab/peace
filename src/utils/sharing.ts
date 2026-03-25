const SITE_URL = 'https://peaceandmusic.net';

export type ShareSource = 'instagram' | 'facebook' | 'twitter' | 'kakao' | 'direct';

export function getMusicianShareUrl(
  musicianId: string,
  source: ShareSource,
  locale: string = 'ko'
): string {
  const basePath = locale === 'ko' ? '' : `/${locale}`;
  const url = new URL(`${basePath}/camps/2026/musicians/${musicianId}`, SITE_URL);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'camp2026');
  url.searchParams.set('utm_content', musicianId);
  return url.toString();
}

export function getCampShareUrl(
  source: ShareSource,
  locale: string = 'ko'
): string {
  const basePath = locale === 'ko' ? '' : `/${locale}`;
  const url = new URL(`${basePath}/camps/2026`, SITE_URL);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'camp2026');
  return url.toString();
}

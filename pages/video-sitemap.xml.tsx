import { GetServerSideProps } from 'next';
import { VideoItem } from '@/types/video';
import { LOCALES, DEFAULT_LOCALE } from '@/constants/locales';
import { loadPublishedVideos } from '@/lib/archivePublicData';

const SITE_URL = 'https://peaceandmusic.net';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getYoutubeVideoId(url: string): string {
  if (url.includes('/embed/')) {
    return url.split('/embed/')[1]?.split('?')[0] || '';
  }
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1]?.split('&')[0] || '';
  }
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  return url.split('/').pop() || '';
}

// "M:SS"/"MM:SS" → 초 단위 정수
function durationToSeconds(duration?: string): number | null {
  if (!duration) return null;
  const parts = duration.split(':').map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return null;
  if (parts.length === 2) {
    const [m, s] = parts as [number, number];
    return m * 60 + s;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts as [number, number, number];
    return h * 3600 + m * 60 + s;
  }
  return null;
}

function getLocalePath(path: string, locale: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return `/${locale}${path}`;
}

export default function VideoSitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const koVideos = (await loadPublishedVideos('ko')).items;

  // locale별 번역 맵 구축 (빌드 시간 1회)
  const localeMap = new Map<string, Map<number, VideoItem>>();
  for (const locale of LOCALES) {
    const items = (await loadPublishedVideos(locale)).items;
    localeMap.set(locale, new Map(items.map((v) => [v.id, v])));
  }

  // 비디오별 모든 locale alternate URL 목록 (hreflang 블록 공유)
  const buildAlternates = (videoPath: string) =>
    [
      ...LOCALES.map(
        (locale) =>
          `      <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(SITE_URL + getLocalePath(videoPath, locale))}"/>`
      ),
      `      <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(SITE_URL + getLocalePath(videoPath, DEFAULT_LOCALE))}"/>`,
    ].join('\n');

  const urlEntries = koVideos
    .flatMap((baseVideo) => {
      const videoId = getYoutubeVideoId(baseVideo.youtubeUrl);
      if (!videoId) return [];

      const videoPath = `/videos/${baseVideo.id}`;
      const thumbnailUrl =
        baseVideo.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const playerUrl = `https://www.youtube.com/embed/${videoId}`;
      const durationSec = durationToSeconds(baseVideo.duration);

      const tags: string[] = ['강정피스앤뮤직캠프', 'Peace Music', 'Anti-war'];
      if (baseVideo.location) tags.push(baseVideo.location);
      if (baseVideo.eventType === 'camp') tags.push('Music Festival', '평화음악캠프');
      if (baseVideo.eventType === 'album') tags.push('Album Release', '앨범 발매');
      if (baseVideo.eventYear) tags.push(String(baseVideo.eventYear));
      const tagXml = tags
        .slice(0, 32) // Google limit
        .map((tag) => `      <video:tag>${escapeXml(tag)}</video:tag>`)
        .join('\n');

      const alternates = buildAlternates(videoPath);

      return LOCALES.map((locale) => {
        const locMap = localeMap.get(locale)!;
        const video = locMap.get(baseVideo.id) ?? baseVideo;
        const description = (video.description || video.title || '').slice(0, 2048);
        const locUrl = SITE_URL + getLocalePath(videoPath, locale);

        return `  <url>
    <loc>${escapeXml(locUrl)}</loc>
    <lastmod>${baseVideo.date}</lastmod>
${alternates}
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      <video:player_loc allow_embed="yes">${escapeXml(playerUrl)}</video:player_loc>
      <video:publication_date>${baseVideo.date}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:requires_subscription>no</video:requires_subscription>
      <video:platform relationship="allow">web mobile tv</video:platform>
${durationSec ? `      <video:duration>${durationSec}</video:duration>\n` : ''}${tagXml}
    </video:video>
  </url>`;
      });
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlEntries}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=43200, stale-while-revalidate=3600');
  res.write(xml);
  res.end();

  return { props: {} };
};

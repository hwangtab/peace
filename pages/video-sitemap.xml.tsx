import { GetServerSideProps } from 'next';
import { loadLocalizedData } from '@/utils/dataLoader';
import { VideoItem } from '@/types/video';

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

export default function VideoSitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const videos = loadLocalizedData<VideoItem>('ko', 'videos.json');

  const urlEntries = videos
    .map((video) => {
      const videoId = getYoutubeVideoId(video.youtubeUrl);
      if (!videoId) return null;

      const pageUrl = `${SITE_URL}/videos/${video.id}`;
      const thumbnailUrl =
        video.thumbnailUrl ||
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const playerUrl = `https://www.youtube.com/embed/${videoId}`;
      const description = (video.description || video.title || '').slice(0, 2048);
      const durationSec = durationToSeconds(video.duration);

      const tags: string[] = ['강정피스앤뮤직캠프', 'Peace Music', 'Anti-war'];
      if (video.location) tags.push(video.location);
      if (video.eventType === 'camp') tags.push('Music Festival', '평화음악캠프');
      if (video.eventType === 'album') tags.push('Album Release', '앨범 발매');
      if (video.eventYear) tags.push(String(video.eventYear));
      const tagXml = tags
        .slice(0, 32) // Google limit
        .map((tag) => `      <video:tag>${escapeXml(tag)}</video:tag>`)
        .join('\n');

      return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <lastmod>${video.date}</lastmod>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      <video:player_loc allow_embed="yes">${escapeXml(playerUrl)}</video:player_loc>
      <video:publication_date>${video.date}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:requires_subscription>no</video:requires_subscription>
      <video:platform relationship="allow">web mobile tv</video:platform>
${durationSec ? `      <video:duration>${durationSec}</video:duration>\n` : ''}${tagXml}
    </video:video>
  </url>`;
    })
    .filter(Boolean)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
>
${urlEntries}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=43200, stale-while-revalidate=3600');
  res.write(xml);
  res.end();

  return { props: {} };
};

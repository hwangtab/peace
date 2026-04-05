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

// This component is never rendered — the page serves raw XML
export default function VideoSitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const videos = loadLocalizedData<VideoItem>('ko', 'videos.json');

  const videoEntries = videos
    .map((video) => {
      const videoId = getYoutubeVideoId(video.youtubeUrl);
      if (!videoId) return null;

      const thumbnailUrl =
        video.thumbnailUrl ||
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const playerUrl = `https://www.youtube.com/embed/${videoId}`;
      const description = (video.description || '').slice(0, 2048);

      return `    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      <video:player_loc>${escapeXml(playerUrl)}</video:player_loc>
      <video:publication_date>${video.date}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>`;
    })
    .filter(Boolean);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
>
  <url>
    <loc>${SITE_URL}/videos</loc>
${videoEntries.join('\n')}
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=43200, stale-while-revalidate=3600');
  res.write(xml);
  res.end();

  return { props: {} };
};

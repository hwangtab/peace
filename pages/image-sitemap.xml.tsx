import { GetServerSideProps } from 'next';
import { loadGalleryImages } from '@/utils/dataLoader';
import { GalleryImage } from '@/types/gallery';

const SITE_URL = 'https://peaceandmusic.net';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// This component is never rendered — the page serves raw XML
export default function ImageSitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const allImages = loadGalleryImages<GalleryImage>();

  // Group images by eventYear for page grouping
  const byYear = new Map<number, GalleryImage[]>();
  for (const img of allImages) {
    const year = img.eventYear || 0;
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(img);
  }

  const urlEntries: string[] = [];

  const buildImageTag = (img: GalleryImage) => {
    const loc = escapeXml(`${SITE_URL}${img.url}`);
    const baseTitle = img.eventType === 'album'
      ? `${img.eventYear} 앨범 발매 기념 공연 — 강정피스앤뮤직캠프`
      : `${img.eventYear} 강정피스앤뮤직캠프`;
    const title = escapeXml(img.description ? `${baseTitle} — ${img.description}` : baseTitle);
    const caption = img.description ? `\n      <image:caption>${escapeXml(img.description)}</image:caption>` : '';
    return `    <image:image>
      <image:loc>${loc}</image:loc>
      <image:title>${title}</image:title>${caption}
      <image:geo_location>Gangjeong Village, Seogwipo, Jeju, South Korea</image:geo_location>
    </image:image>`;
  };

  // Gallery index page — top 20 images
  const topImages = allImages.slice(0, 20);
  if (topImages.length > 0) {
    const imageXml = topImages.map(buildImageTag).join('\n');
    urlEntries.push(`  <url>
    <loc>${SITE_URL}/gallery</loc>
${imageXml}
  </url>`);
  }

  // Per-year camp pages
  for (const [year, images] of byYear.entries()) {
    if (!year) continue;
    const campPath = `/camps/${year}`;

    const imageXml = images
      .slice(0, 30)
      .map(buildImageTag)
      .join('\n');

    urlEntries.push(`  <url>
    <loc>${SITE_URL}${campPath}</loc>
${imageXml}
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urlEntries.join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=43200, stale-while-revalidate=3600');
  res.write(xml);
  res.end();

  return { props: {} };
};

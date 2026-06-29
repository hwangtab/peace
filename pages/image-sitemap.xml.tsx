import { GetServerSideProps } from 'next';
import { GalleryImage } from '@/types/gallery';
import { loadPublishedGallery } from '@/lib/archivePublicData';
import { escapeXml } from '@/utils/xml';

// pageComponents 키와 동기화 — 이 목록에 없는 year 는 /camps/${year} 가 404 임
const VALID_CAMP_YEARS = new Set([2023, 2025, 2026]);

const SITE_URL = 'https://peaceandmusic.net';

// This component is never rendered — the page serves raw XML
export default function ImageSitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const allImages = (await loadPublishedGallery('ko')).items;

  // Group images by eventYear for page grouping
  const byYear = new Map<number, GalleryImage[]>();
  for (const img of allImages) {
    const year = img.eventYear || 0;
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(img);
  }

  const urlEntries: string[] = [];

  // Google 은 2022-08 부터 image:title·image:caption·image:geo_location·image:license
  // 를 색인에 사용하지 않는다(현재 유효 태그는 image:loc 뿐). 갤러리도 정적 SSOT 라
  // 로케일별 번역 데이터가 없어 다국어화 실익이 없으므로 image:loc 만 출력한다.
  const buildImageTag = (img: GalleryImage) => {
    const loc = escapeXml(`${SITE_URL}${img.url}`);
    return `    <image:image>
      <image:loc>${loc}</image:loc>
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

  // Per-year camp pages — camp 타입만, 유효한 year 화이트리스트 적용
  // album(eventYear=2024)은 /camps/2024 가 없으므로 아래 album 섹션에서 처리
  for (const [year, images] of byYear.entries()) {
    if (!year || !VALID_CAMP_YEARS.has(year)) continue;
    const campYearImages = images.filter((img) => img.eventType !== 'album');
    if (campYearImages.length === 0) continue;

    const imageXml = campYearImages.slice(0, 30).map(buildImageTag).join('\n');

    urlEntries.push(`  <url>
    <loc>${SITE_URL}/camps/${year}</loc>
${imageXml}
  </url>`);
  }

  // Album 이미지 → /album/about 에 매핑
  const albumImages = allImages.filter((img) => img.eventType === 'album');
  if (albumImages.length > 0) {
    const imageXml = albumImages.slice(0, 30).map(buildImageTag).join('\n');
    urlEntries.push(`  <url>
    <loc>${SITE_URL}/album/about</loc>
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

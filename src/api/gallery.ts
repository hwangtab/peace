import { GalleryImage } from '../types/gallery';
import { fetchArchiveItems } from './archive';
import { fetchLocalData } from './client';

/** public/data/gallery/*.json 각 파일에 대응하는 카테고리. */
export type GalleryCategory = 'album' | 'camp2023' | 'camp2025' | 'camp2026';

export const GALLERY_CATEGORIES: readonly GalleryCategory[] = [
  'album',
  'camp2023',
  'camp2025',
  'camp2026',
];

// 카테고리별 fetch 결과를 모듈 전역에 캐시(세션 내 지속)한다. 같은 카테고리를
// 필터 재방문 시 재요청하지 않기 위함. 실패한 요청은 캐시에서 제거해 다음
// 시도에서 재요청을 허용한다.
const categoryCache = new Map<GalleryCategory, Promise<GalleryImage[]>>();

/**
 * 갤러리 카테고리 하나만 fetch 한다 (모듈 레벨 캐시 적용). 지연 로드(필터 전환
 * 시점에만 필요한 카테고리를 받는 것)의 최소 단위.
 */
export const fetchGalleryCategory = (category: GalleryCategory): Promise<GalleryImage[]> => {
  const cached = categoryCache.get(category);
  if (cached) return cached;

  const request = fetchLocalData<GalleryImage>(`/data/gallery/${category}.json`).catch((error) => {
    console.warn('[gallery] category fetch failed:', category, error);
    categoryCache.delete(category);
    return [] as GalleryImage[];
  });

  categoryCache.set(category, request);
  return request;
};

/**
 * 지정된 카테고리들의 갤러리 이미지만 fetch 한다 (병렬, 카테고리별 캐시 적용).
 * 필터 전환 시 필요한 카테고리만 받아오기 위한 API — useGalleryImages 가 사용.
 */
export const getGalleryImagesByCategories = async (
  categories: readonly GalleryCategory[]
): Promise<GalleryImage[]> => {
  const results = await Promise.all(categories.map(fetchGalleryCategory));
  return results.flat();
};

/**
 * 전체 갤러리 이미지를 fetch 한다. CMS(archive API)를 우선 조회하고, 없으면
 * 카테고리별 정적 JSON 전량을 합쳐 반환한다. 필터 구분 없이 전체 목록이
 * 필요한 호출부(예: AlbumAboutPage)용 — 카테고리 단위 지연 로드가 필요하면
 * getGalleryImagesByCategories 를 사용하라.
 */
export const getGalleryImages = async (language?: string): Promise<GalleryImage[]> => {
  const cmsItems = await fetchArchiveItems<GalleryImage>('gallery', language);
  if (cmsItems) return cmsItems;

  return getGalleryImagesByCategories(GALLERY_CATEGORIES);
};

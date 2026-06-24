import { FilterId } from '@/utils/filtering';

/**
 * 캠프별 사진 작가 정보.
 * 제3회(2026) 캠프부터 갤러리에 작가 소개·크레딧을 노출한다.
 *
 * name/bio 는 다국어 번역 키(gallery 네임스페이스)로 관리한다:
 *   gallery.photographers.{slug}.name
 *   gallery.photographers.{slug}.bio
 */
export interface Photographer {
  /** GalleryImage.photographer 와 매칭되는 식별자 */
  slug: string;
  /** 작가 프로필 사진 (없으면 페이지에서 대표작으로 폴백) */
  image?: string;
}

/** 연도별 작가 목록 (소개 카드 노출 순서) */
export const photographersByYear: Record<number, Photographer[]> = {
  2026: [
    { slug: 'kdh', image: '/images-webp/photographers/kdh.webp' },
    { slug: 'kwdh', image: '/images-webp/photographers/kwdh.webp' },
  ],
};

/** slug 로 작가 정보를 찾는다 (연도 무관) */
export const findPhotographer = (slug: string): Photographer | undefined =>
  Object.values(photographersByYear)
    .flat()
    .find((p) => p.slug === slug);

const FILTER_YEAR: Partial<Record<FilterId, number>> = {
  'camp-2023': 2023,
  'camp-2025': 2025,
  'camp-2026': 2026,
};

/** 갤러리 필터에 해당하는 작가 목록을 반환 (없으면 빈 배열) */
export const getPhotographersForFilter = (filter: FilterId): Photographer[] => {
  const year = FILTER_YEAR[filter];
  return year ? (photographersByYear[year] ?? []) : [];
};

/** slug 로 작가의 표시 이름 번역 키를 만든다 */
export const photographerNameKey = (slug: string): string => `gallery.photographers.${slug}.name`;

/** 전 연도에 걸친 고유 작가 slug 목록 (작가 전용 페이지 getStaticPaths 용) */
export const allPhotographerSlugs = (): string[] => {
  const slugs = new Set<string>();
  for (const list of Object.values(photographersByYear)) {
    for (const p of list) slugs.add(p.slug);
  }
  return [...slugs];
};

/** 관리자 작가 드롭다운에 쓰는 항목 */
export interface PhotographerOption {
  slug: string;
  name: string;
}

/**
 * 관리자 드롭다운용 작가 목록(slug + 표시 이름)을 만든다.
 * 이름은 gallery 번역 사전(gallery.json의 photographers 섹션)에서 가져오고,
 * 없으면 slug 자체를 표시 이름으로 쓴다.
 */
export const buildPhotographerOptions = (
  galleryPhotographers?: Record<string, { name?: string }> | null
): PhotographerOption[] =>
  allPhotographerSlugs().map((slug) => ({
    slug,
    name: galleryPhotographers?.[slug]?.name?.trim() || slug,
  }));

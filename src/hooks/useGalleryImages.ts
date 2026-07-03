import { useState, useEffect, useMemo, useRef } from 'react';
import { GalleryImage } from '../types/gallery';
import { GalleryCategory, GALLERY_CATEGORIES, fetchGalleryCategory } from '../api/gallery';
import { FilterId, filterByEvent } from '../utils/filtering';
import { useFilterFromQuery } from './useFilterFromQuery';

interface UseGalleryImagesReturn {
  images: GalleryImage[];
  filteredImages: GalleryImage[];
  selectedFilter: FilterId;
  setSelectedFilter: (filter: FilterId) => void;
  isLoading: boolean;
}

const EMPTY_GALLERY_IMAGES: GalleryImage[] = [];

const sortGalleryImages = (items: GalleryImage[]) =>
  items.slice().sort((a, b) => {
    if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
    return b.id - a.id;
  });

// FilterId(단일 카테고리 한정) → 대응하는 gallery JSON 카테고리.
// src/utils/filtering.ts 의 filterMap({type, year})과 1:1 대응한다.
const FILTER_CATEGORY_MAP: Record<Exclude<FilterId, 'all'>, GalleryCategory> = {
  'album-2024': 'album',
  'camp-2023': 'camp2023',
  'camp-2025': 'camp2025',
  'camp-2026': 'camp2026',
};

const categoriesForFilter = (filter: FilterId): GalleryCategory[] =>
  filter === 'all' ? [...GALLERY_CATEGORIES] : [FILTER_CATEGORY_MAP[filter]];

// SSR 프리뷰(연도 desc 정렬 top N)의 첫 이미지가 속한 카테고리를 추정한다.
// '전체' 필터처럼 여러 카테고리가 한꺼번에 필요할 때, 이미 화면에 보이는
// 프리뷰와 이어지는 카테고리를 최우선으로 받기 위함.
const categoryOfImage = (image: GalleryImage): GalleryCategory => {
  if (image.eventType === 'album') return 'album';
  if (image.eventYear === 2023) return 'camp2023';
  if (image.eventYear === 2025) return 'camp2025';
  return 'camp2026';
};

const dedupeByUrl = (items: GalleryImage[]): GalleryImage[] => {
  const map = new Map<string, GalleryImage>();
  items.forEach((item) => map.set(item.url, item));
  return Array.from(map.values());
};

/**
 * Custom hook for managing gallery image loading, filtering, and pagination.
 *
 * 현재 선택된 필터(카테고리/연도)에 필요한 JSON만 우선 fetch 하고, 나머지
 * 카테고리는 필터 전환 시점에 받는다. '전체' 필터처럼 여러 카테고리가 한꺼번에
 * 필요한 경우, SSR 프리뷰와 이어지는 대표 카테고리를 먼저 받아 화면을 채우고
 * 나머지는 그 직후 병렬로 이어받아 — 초기 진입 시 4개 카테고리를 한 번에 묶어
 * 받지 않는다. 카테고리별 fetch 결과는 api/gallery.ts 의 모듈 캐시로 세션 내
 * 재요청을 방지한다.
 */
export const useGalleryImages = (
  initialImages: GalleryImage[] = EMPTY_GALLERY_IMAGES,
  skipClientFetch = false,
  // 갤러리 정적 JSON은 로케일별로 나뉘지 않아 데이터 fetch에는 쓰이지 않지만,
  // 호출부(GallerySection)와의 시그니처 호환을 위해 인자는 유지한다.
  _locale = 'ko'
): UseGalleryImagesReturn => {
  const [selectedFilter, setSelectedFilter] = useFilterFromQuery();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  // mount 시점 스냅샷 — caller 가 매 렌더 새 [] 참조를 넘겨도 effect 재실행 방지
  const initialImagesRef = useRef(initialImages);
  const [isLoading, setIsLoading] = useState<boolean>(initialImages.length === 0);

  // 지금까지 로드된 카테고리별 이미지. 컴포넌트 생명주기 동안 유지되며, 필터를
  // 오갈 때 이미 로드된 카테고리를 다시 fetch 하지 않도록 훅 레벨에서도 추적한다.
  const loadedByCategoryRef = useRef<Map<GalleryCategory, GalleryImage[]>>(new Map());

  // Fetch 필요한 카테고리만 백그라운드에서 불러온다. skipClientFetch 가 true면
  // 건너뛴다(SSG-only 렌더 의도).
  // initialImagesRef 를 deps 대신 사용해 caller 의 array identity 변화로 재실행되지 않게 방지.
  useEffect(() => {
    const initial = initialImagesRef.current;
    if (initial.length > 0) {
      setImages(sortGalleryImages(initial));
    }

    if (skipClientFetch) {
      setIsLoading(false);
      return;
    }

    const needed = categoriesForFilter(selectedFilter).filter(
      (cat) => !loadedByCategoryRef.current.has(cat)
    );

    if (needed.length === 0) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    const mergeLoaded = () => {
      const loaded = Array.from(loadedByCategoryRef.current.values()).flat();
      return dedupeByUrl([...initialImagesRef.current, ...loaded]);
    };

    const loadImages = async () => {
      try {
        // needed.length === 0 인 경우 상위에서 이미 return 했으므로 needed[0]은
        // 항상 존재하지만, noUncheckedIndexedAccess 때문에 명시적으로 좁혀둔다.
        const firstNeeded = needed[0];
        if (!firstNeeded) return;

        // 여러 카테고리가 한꺼번에 필요한 경우(주로 '전체' 필터), 이미 표시
        // 중인 SSR 프리뷰와 이어지는 카테고리를 먼저 받아 화면을 채우고,
        // 나머지는 그 직후 병렬로 이어받는다. 특정 필터는 needed 가 항상
        // 1개뿐이라 바로 그 카테고리 하나만 받고 끝난다.
        const firstInitial = initial[0];
        const previewCategory = firstInitial ? categoryOfImage(firstInitial) : null;
        const primary =
          previewCategory && needed.includes(previewCategory) ? previewCategory : firstNeeded;
        const rest = needed.filter((cat) => cat !== primary);

        const primaryImages = await fetchGalleryCategory(primary);
        if (isCancelled) return;
        loadedByCategoryRef.current.set(primary, primaryImages);
        setImages(sortGalleryImages(mergeLoaded()));

        if (rest.length > 0) {
          const restResults = await Promise.all(rest.map(fetchGalleryCategory));
          if (isCancelled) return;
          rest.forEach((cat, i) => loadedByCategoryRef.current.set(cat, restResults[i] ?? []));
          setImages(sortGalleryImages(mergeLoaded()));
        }
      } catch (error) {
        console.error('Failed to load gallery images:', error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  }, [skipClientFetch, selectedFilter]);

  // Filter images based on selected filter
  const filteredImages = useMemo(
    () => filterByEvent(images, selectedFilter),
    [images, selectedFilter]
  );

  return {
    images,
    filteredImages,
    selectedFilter,
    setSelectedFilter,
    isLoading,
  };
};

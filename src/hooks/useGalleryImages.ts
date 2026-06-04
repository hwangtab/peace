import { useState, useEffect, useMemo, useRef } from 'react';
import { GalleryImage } from '../types/gallery';
import { getGalleryImages } from '../api/gallery';
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

/**
 * Custom hook for managing gallery image loading, filtering, and pagination.
 * Extracts complex state logic from GallerySection for better maintainability.
 */
export const useGalleryImages = (
  initialImages: GalleryImage[] = EMPTY_GALLERY_IMAGES,
  skipClientFetch = false
): UseGalleryImagesReturn => {
  const [selectedFilter, setSelectedFilter] = useFilterFromQuery();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  // mount 시점 스냅샷 — caller 가 매 렌더 새 [] 참조를 넘겨도 effect 재실행 방지
  const initialImagesRef = useRef(initialImages);
  const [isLoading, setIsLoading] = useState<boolean>(initialImages.length === 0);

  // Fetch full gallery in background unless skipClientFetch is true.
  // When initialImages exist, render them immediately and replace with full data after fetch.
  // initialImagesRef 를 deps 대신 사용해 caller 의 array identity 변화로 재실행되지 않게 방지.
  useEffect(() => {
    const initial = initialImagesRef.current;
    if (initial.length > 0) {
      setImages(sortGalleryImages(initial));
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // Caller가 preview-only 또는 SSG-only 렌더를 의도한 경우, 초기 이미지 유무와
    // 무관하게 전체 갤러리 JSON fetch를 건너뛴다.
    if (skipClientFetch) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadImages = async () => {
      try {
        const allFetchedImages = await getGalleryImages();

        if (isCancelled) return;

        const sortedImages = sortGalleryImages(allFetchedImages);
        setImages(sortedImages);
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
  }, [skipClientFetch]);

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

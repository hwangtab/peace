import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { GalleryImage } from '../types/gallery';
import { getGalleryImages } from '../api/gallery';
import { FilterId, filterByEvent, isValidFilter } from '../utils/filtering';

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
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('all');
  const [isLoading, setIsLoading] = useState<boolean>(initialImages.length === 0);

  // Sync filter with query parameter on mount
  useEffect(() => {
    if (!router.isReady) return;
    const filterParam = typeof router.query.filter === 'string' ? router.query.filter : null;
    if (filterParam && isValidFilter(filterParam)) {
      setSelectedFilter(filterParam);
    }
  }, [router.isReady, router.query.filter]);

  // Fetch full gallery in background unless skipClientFetch is true.
  // When initialImages exist, render them immediately and replace with full data after fetch.
  useEffect(() => {
    if (initialImages.length > 0) {
      setImages(sortGalleryImages(initialImages));
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    // SSG에서 전체 데이터를 이미 받은 경우 클라이언트 fetch 스킵
    if (skipClientFetch && initialImages.length > 0) return;

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
  }, [initialImages, skipClientFetch]);

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

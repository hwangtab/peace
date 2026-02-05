import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GalleryImage } from '../types/gallery';
import { getGalleryImages } from '../api/gallery';
import { filterByEvent, isValidFilter } from '../utils/filtering';
import { GALLERY_CONFIG } from '../constants/config';

interface UseGalleryImagesReturn {
  images: GalleryImage[];
  filteredImages: GalleryImage[];
  displayImages: GalleryImage[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  visibleCount: number;
  hasMore: boolean;
  loadMore: () => void;
  isLoading: boolean;
}

/**
 * Custom hook for managing gallery image loading, filtering, and pagination.
 * Extracts complex state logic from GallerySection for better maintainability.
 */
export const useGalleryImages = (): UseGalleryImagesReturn => {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(GALLERY_CONFIG.INITIAL_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync filter with query parameter on mount
  useEffect(() => {
    if (!router.isReady) return;
    const filterParam = typeof router.query.filter === 'string' ? router.query.filter : null;
    if (filterParam && isValidFilter(filterParam)) {
      setSelectedFilter(filterParam);
    }
  }, [router.isReady, router.query.filter]);

  // Load images on mount
  useEffect(() => {
    let isCancelled = false;

    const loadImages = async () => {
      setIsLoading(true);
      try {
        const allFetchedImages = await getGalleryImages();

        if (isCancelled) return;

        const sortedImages = allFetchedImages.sort((a, b) => {
          if (a.eventYear !== b.eventYear) return (a.eventYear || 0) - (b.eventYear || 0);
          return a.id - b.id;
        });

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
  }, []);

  // Filter images based on selected filter
  const filteredImages = useMemo(
    () => filterByEvent(images, selectedFilter),
    [images, selectedFilter]
  );

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(GALLERY_CONFIG.INITIAL_VISIBLE_COUNT);
  }, [selectedFilter]);

  // Load more handler
  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + GALLERY_CONFIG.LOAD_MORE_COUNT, filteredImages.length)
    );
  }, [filteredImages.length]);

  // Slice images for display
  const displayImages = useMemo(
    () => filteredImages.slice(0, visibleCount),
    [filteredImages, visibleCount]
  );

  const hasMore = visibleCount < filteredImages.length;

  return {
    images,
    filteredImages,
    displayImages,
    selectedFilter,
    setSelectedFilter,
    visibleCount,
    hasMore,
    loadMore,
    isLoading,
  };
};

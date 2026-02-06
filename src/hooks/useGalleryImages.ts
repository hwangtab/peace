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
  isLoading: boolean;
}

/**
 * Custom hook for managing gallery image loading, filtering, and pagination.
 * Extracts complex state logic from GallerySection for better maintainability.
 */
export const useGalleryImages = (initialImages: GalleryImage[] = []): UseGalleryImagesReturn => {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(initialImages.length === 0);

  // Sync filter with query parameter on mount
  useEffect(() => {
    if (!router.isReady) return;
    const filterParam = typeof router.query.filter === 'string' ? router.query.filter : null;
    if (filterParam && isValidFilter(filterParam)) {
      setSelectedFilter(filterParam);
    }
  }, [router.isReady, router.query.filter]);

  // Load images on mount if not provided via props
  useEffect(() => {
    if (initialImages.length > 0) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadImages = async () => {
      setIsLoading(true);
      try {
        const allFetchedImages = await getGalleryImages();

        if (isCancelled) return;

        const sortedImages = allFetchedImages.sort((a, b) => {
          if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
          return b.id - a.id;
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
  }, [initialImages.length]);

  // Filter images based on selected filter
  const filteredImages = useMemo(
    () => filterByEvent(images, selectedFilter),
    [images, selectedFilter]
  );

  // Slice images for display (Now returning all filtered images)
  const displayImages = filteredImages;

  return {
    images,
    filteredImages,
    displayImages,
    selectedFilter,
    setSelectedFilter,
    isLoading,
  };
};

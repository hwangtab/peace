import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { GalleryImage } from '../types/gallery';
import { getGalleryImages } from '../api/gallery';
import { filterByEvent, isValidFilter } from '../utils/filtering';

interface UseGalleryImagesReturn {
  images: GalleryImage[];
  filteredImages: GalleryImage[];
  displayImages: GalleryImage[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  isLoading: boolean;
}

const EMPTY_GALLERY_IMAGES: GalleryImage[] = [];

const sortGalleryImages = (items: GalleryImage[]) => items.slice().sort((a, b) => {
  if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
  return b.id - a.id;
});

/**
 * Custom hook for managing gallery image loading, filtering, and pagination.
 * Extracts complex state logic from GallerySection for better maintainability.
 */
export const useGalleryImages = (initialImages: GalleryImage[] = EMPTY_GALLERY_IMAGES): UseGalleryImagesReturn => {
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

  // Always fetch full gallery in background.
  // When initialImages exist, render them immediately and replace with full data after fetch.
  useEffect(() => {
    if (initialImages.length > 0) {
      setImages(sortGalleryImages(initialImages));
      setIsLoading(false);
    } else {
      setIsLoading(true);
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
  }, [initialImages]);

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

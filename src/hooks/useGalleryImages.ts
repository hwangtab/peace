import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [visibleCount, setVisibleCount] = useState<number>(GALLERY_CONFIG.INITIAL_VISIBLE_COUNT);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Sync filter with query parameter on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filterParam = params.get('filter');
        if (filterParam && isValidFilter(filterParam)) {
            setSelectedFilter(filterParam);
        }
    }, [location.search]);

    // Load images on mount
    useEffect(() => {
        let isCancelled = false;

        const loadImages = async () => {
            setIsLoading(true);
            const allFetchedImages = await getGalleryImages();

            if (isCancelled) return;

            const sortedImages = allFetchedImages.sort((a, b) => {
                if (a.eventYear !== b.eventYear) return (a.eventYear || 0) - (b.eventYear || 0);
                return a.id - b.id;
            });

            setImages(sortedImages);
            setIsLoading(false);
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
        setVisibleCount(prev => Math.min(prev + GALLERY_CONFIG.LOAD_MORE_COUNT, filteredImages.length));
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

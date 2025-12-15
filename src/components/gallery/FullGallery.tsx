import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryImage } from '../../types/gallery';
import { getGalleryImages } from '../../api/gallery';
import Section from '../layout/Section';
import EventFilter from './EventFilter';
import GalleryImageItem from './GalleryImageItem';

interface FullGalleryProps {
    className?: string;
}

const FullGallery: React.FC<FullGalleryProps> = ({ className }) => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(12); // Start with more images for full page
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        const loadImages = async () => {
            const galleryImages = await getGalleryImages();
            // Sort: Newest year first, then by ID
            const sortedImages = [...galleryImages].sort((a, b) => {
                if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
                return b.id - a.id;
            });
            setImages(sortedImages);
        };
        loadImages();
    }, []);

    const filteredImages = useMemo(() => {
        return images.filter(img => {
            if (selectedFilter === 'all') return true;
            if (selectedFilter === 'camp-2023') return img.eventType === 'camp' && img.eventYear === 2023;
            if (selectedFilter === 'album-2024') return img.eventType === 'album' && img.eventYear === 2024;
            if (selectedFilter === 'camp-2025') return img.eventType === 'camp' && img.eventYear === 2025;
            return true;
        });
    }, [images, selectedFilter]);

    const displayImages = useMemo(() => {
        return filteredImages.slice(0, visibleCount);
    }, [filteredImages, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 12);
    };

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        setVisibleCount(12); // Reset pagination on filter change
    };

    return (
        <Section id="full-gallery" background="seafoam" className={className}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="typo-h2 mb-4 text-gray-900">
                        평화의 순간들
                    </h2>
                    <p className="typo-subtitle mb-8 text-gray-600">
                        강정에서 피어난 연대와 환대의 기억을 모았습니다.
                    </p>
                    <div className="w-24 h-1 bg-jeju-ocean mx-auto rounded-full mb-12" />
                </div>

                {/* Filter Navigation */}
                <EventFilter
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                />

                {/* Gallery Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                >
                    <AnimatePresence mode='popLayout'>
                        {displayImages.map((image) => (
                            <motion.div
                                key={image.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <GalleryImageItem
                                    image={image}
                                    onClick={setSelectedImage}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Load More Button */}
                {visibleCount < filteredImages.length && (
                    <div className="text-center mt-16">
                        <button
                            onClick={handleLoadMore}
                            className="px-8 py-3 bg-white text-jeju-ocean border-2 border-jeju-ocean rounded-full font-bold hover:bg-jeju-ocean hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            더 보기
                        </button>
                    </div>
                )}

                {/* Lightbox Modal */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-12 right-0 text-white hover:text-jeju-ocean transition-colors p-2"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <img
                                    src={selectedImage.url}
                                    alt={selectedImage.description || 'Gallery Preview'}
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                />
                                {selectedImage.description && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white text-center rounded-b-lg">
                                        <p className="text-lg font-medium">{selectedImage.description}</p>
                                        <p className="text-sm opacity-80 mt-1">{selectedImage.eventYear}</p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Section>
    );
};

export default FullGallery;

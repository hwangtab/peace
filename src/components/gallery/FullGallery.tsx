import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryImage } from '../../types/gallery';
import { getGalleryImages } from '../../api/gallery';
import Section from '../layout/Section';
import EventFilter from './EventFilter';
import SEOHelmet from '../shared/SEOHelmet';
import { getBreadcrumbSchema, getImageGallerySchema } from '../../utils/structuredData';

interface FullGalleryProps {
    className?: string;
}

const FullGallery: React.FC<FullGalleryProps> = ({ className }) => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(12);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [loadedImages, setLoadedImages] = useState<string[]>([]);

    useEffect(() => {
        const loadImages = async () => {
            try {
                const galleryImages = await getGalleryImages();
                // Sort: Newest year first, then by ID
                const sortedImages = [...galleryImages].sort((a, b) => {
                    if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
                    return b.id - a.id;
                });
                setImages(sortedImages);
            } catch (error) {
                console.error('Error loading gallery images:', error);
            }
        };
        loadImages();
    }, []);

    const handleImageLoad = (src: string) => {
        setLoadedImages(prev => [...prev, src]);
    };

    const handleImageError = (src: string) => {
        console.log('Image error:', src);
        // Optional: Remove broken images or show placeholder
    };

    const filteredImages = useMemo(() => {
        return images.filter(img => {
            if (selectedFilter === 'all') return true;
            // Filter logic matches presumed requirements based on EventFilter.tsx
            // Note: Update these IDs if EventFilter uses different ones
            if (selectedFilter === 'camp-2023') return img.eventYear === 2023;
            if (selectedFilter === 'album-2024') return img.eventYear === 2024;
            if (selectedFilter === 'camp-2025') return img.eventYear === 2025;
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
        setVisibleCount(12);
    };

    // Restored Structured Data
    const breadcrumbs = [
        { name: "홈", url: "https://peaceandmusic.net/" },
        { name: "갤러리", url: "https://peaceandmusic.net/gallery" }
    ];

    // Create image list for SEO (limit to first 20 to avoid huge payload)
    const imageListForSEO = images.slice(0, 20).map(img => ({
        url: `https://peaceandmusic.net${img.url}`,
        caption: img.description || `Gallery image ${img.id}`
    }));

    return (
        <Section id="full-gallery" background="seafoam" className={className}>
            <SEOHelmet
                title="갤러리 | 이름을 모르는 먼 곳의 그대에게"
                description="평화를 노래하는 우리들의 순간들. 평화 프로젝트의 다양한 활동 모습과 뮤지션들의 순간을 담은 사진 갤러리."
                keywords="갤러리, 사진, 평화 프로젝트 사진, 뮤지션 사진"
                canonicalUrl="https://peaceandmusic.net/gallery"
                structuredData={[
                    getBreadcrumbSchema(breadcrumbs),
                    getImageGallerySchema(imageListForSEO)
                ]}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="typo-h2 mb-4 text-gray-900">
                        갤러리
                    </h2>
                    <p className="typo-subtitle mb-8 text-gray-600">
                        평화를 노래하는 우리들의 순간들
                    </p>
                    <div className="w-24 h-1 bg-jeju-ocean mx-auto rounded-full mb-12" />
                </motion.div>

                {/* Filter Navigation - Keeping this as requested by user ("Category buttons lost") */}
                <EventFilter
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                />

                {/* Gallery Grid - Restored Responsive Classes */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
                                <div
                                    className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.description || `Gallery image ${image.id}`}
                                        onLoad={() => handleImageLoad(image.url)}
                                        onError={() => handleImageError(image.url)}
                                        className={`absolute w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 ${loadedImages.includes(image.url) ? 'opacity-100' : 'opacity-0'}`}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                    {/* Description overlay if available */}
                                    {image.description && (
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <p className="text-white text-sm font-medium truncate">{image.description}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Load More - Keeping functional */}
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

                {/* Lightbox - Restored Design */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <img
                                    src={selectedImage.url}
                                    alt={selectedImage.description || 'Gallery Preview'}
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                />
                                {selectedImage.description && (
                                    <div className="absolute -bottom-10 left-0 right-0 text-center">
                                        <p className="text-white/90 font-medium">{selectedImage.description}</p>
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

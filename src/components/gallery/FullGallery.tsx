import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryImage } from '../../types/gallery';
import { getGalleryImages } from '../../api/gallery';
import Section from '../layout/Section';
import EventFilter from './EventFilter';
import GalleryImageItem from './GalleryImageItem';
import SEOHelmet from '../shared/SEOHelmet';
import { getBreadcrumbSchema, getImageGallerySchema } from '../../utils/structuredData';

interface FullGalleryProps {
    className?: string;
}

// Animation variants from original GallerySection
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const FullGallery: React.FC<FullGalleryProps> = ({ className }) => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(12);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        const loadImages = async () => {
            try {
                const galleryImages = await getGalleryImages();
                // Fix: Restore original sort order (Year Ascending)
                // User complaint: "Order is a mess" -> implied they wanted chronological or specific original order
                const sortedImages = [...galleryImages].sort((a, b) => {
                    if (a.eventYear !== b.eventYear) return (a.eventYear || 0) - (b.eventYear || 0);
                    return a.id - b.id;
                });
                setImages(sortedImages);
            } catch (error) {
                console.error('Error loading gallery images:', error);
            }
        };
        loadImages();
    }, []);

    const filteredImages = useMemo(() => {
        let filtered = [...images];

        if (selectedFilter !== 'all') {
            if (selectedFilter === 'album-2024') {
                filtered = images.filter(img => img.eventType === 'album' && img.eventYear === 2024);
            } else if (selectedFilter === 'camp-2023') {
                filtered = images.filter(img => img.eventType === 'camp' && img.eventYear === 2023);
            } else if (selectedFilter === 'camp-2025') {
                filtered = images.filter(img => img.eventType === 'camp' && img.eventYear === 2025);
            }
        }

        // Ensure consistent sort after filtering
        return filtered.sort((a, b) => {
            if (a.eventYear !== b.eventYear) return (a.eventYear || 0) - (b.eventYear || 0);
            return a.id - b.id;
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

    // SEO Data
    const breadcrumbs = [
        { name: "홈", url: "https://peaceandmusic.net/" },
        { name: "갤러리", url: "https://peaceandmusic.net/gallery" }
    ];

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
                        평화를 노래하는 순간들
                    </p>
                </motion.div>

                <EventFilter
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                />

                {filteredImages.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 rounded-lg">
                        <p className="text-xl text-gray-500 font-serif">등록된 사진이 없습니다.</p>
                    </div>
                ) : (
                    <>
                        {/* Gallery Grid - Restored Animations & Variants */}
                        <motion.div
                            layout
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        >
                            <AnimatePresence mode='popLayout'>
                                {displayImages.map((image, index) => (
                                    <motion.div
                                        key={image.id}
                                        layout
                                        variants={itemVariants}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <GalleryImageItem
                                            image={image}
                                            priority={index < 6}
                                            onClick={setSelectedImage}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {visibleCount < filteredImages.length && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-8 py-3 bg-white border border-jeju-ocean text-jeju-ocean rounded-full font-medium hover:bg-jeju-ocean hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    더 보기
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Lightbox Modal */}
                <AnimatePresence>
                    {selectedImage && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedImage(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <img
                                    src={selectedImage.url}
                                    alt={selectedImage.description || 'Gallery Preview'}
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg"
                                />
                                {selectedImage.description && (
                                    <div className="absolute -bottom-10 left-0 right-0 text-center">
                                        <p className="text-white/90 font-medium">{selectedImage.description}</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Section>
    );
};

export default FullGallery;

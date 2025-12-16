import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryImage } from '../../types/gallery';
import { getGalleryImages } from '../../api/gallery';
import EventFilter from '../gallery/EventFilter';
import GalleryImageItem from '../gallery/GalleryImageItem';
import ImageLightbox from '../common/ImageLightbox';
import Section from '../layout/Section';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface GallerySectionProps {
  className?: string;
  enableSectionWrapper?: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({
  className,
  enableSectionWrapper = true
}) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  useEffect(() => {
    const loadImages = async () => {
      const galleryImages = await getGalleryImages();
      // Initial sort: Year ascending, then ID ascending
      const sortedImages = [...galleryImages].sort((a, b) => {
        if (a.eventYear !== b.eventYear) return (a.eventYear || 0) - (b.eventYear || 0);
        return a.id - b.id;
      });
      setImages(sortedImages);
    };
    loadImages();
  }, []);

  // Optimized: Filter without re-sorting (data is already sorted)
  const filteredImages = useMemo(() => {
    if (selectedFilter === 'all') return images;

    return images.filter(img => {
      if (selectedFilter === 'album-2024') return img.eventType === 'album' && img.eventYear === 2024;
      if (selectedFilter === 'camp-2023') return img.eventType === 'camp' && img.eventYear === 2023;
      if (selectedFilter === 'camp-2025') return img.eventType === 'camp' && img.eventYear === 2025;
      return true;
    });
  }, [selectedFilter, images]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedFilter]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const displayImages = useMemo(() => filteredImages.slice(0, visibleCount), [filteredImages, visibleCount]);

  const content = (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${!enableSectionWrapper ? className : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="typo-h2 mb-4 text-gray-900">
          평화의 순간들
        </h2>
        <p className="typo-subtitle mb-8 text-gray-600">
          평화를 노래하는 순간들
        </p>
      </motion.div>

      <EventFilter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

      {filteredImages.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-lg">
          <p className="text-xl text-gray-500 font-serif">등록된 사진이 없습니다.</p>
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
          >
            <AnimatePresence mode='popLayout'>
              {displayImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
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

      {selectedImage && (
        <ImageLightbox
          image={{
            url: selectedImage.url,
            alt: selectedImage.description || `Gallery image ${selectedImage.id}`
          }}
          onClose={() => setSelectedImage(null)}
          maxHeight="85vh"
        />
      )}
    </div>
  );

  if (enableSectionWrapper) {
    return (
      <Section id="gallery" background="seafoam" className={className}>
        {content}
      </Section>
    );
  }

  return content;
};

export default GallerySection;

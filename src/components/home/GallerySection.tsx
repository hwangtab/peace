import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { GalleryImage } from '../../types/gallery';
import { filterByEvent, isValidFilter } from '../../utils/filtering';
import EventFilter from '../common/EventFilter';
import GalleryImageItem from '../gallery/GalleryImageItem';
import ImageLightbox from '../common/ImageLightbox';
import Section from '../layout/Section';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';
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
  const location = useLocation();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Sync filter with query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam && isValidFilter(filterParam)) {
      setSelectedFilter(filterParam);
    }
  }, [location.search]);

  useEffect(() => {
    let isCancelled = false;

    const loadImages = async () => {
      try {
        const categories = ['album', 'camp2023', 'camp2025'];

        // Promise.all로 병렬 처리 (성능 개선 + 개별 에러 처리)
        const responses = await Promise.all(
          categories.map(cat =>
            fetch(`/data/gallery/${cat}.json`)
              .then(res => {
                if (!res.ok) {
                  console.warn(`Failed to fetch gallery/${cat}.json: ${res.status}`);
                  return [];
                }
                return res.json();
              })
              .catch(err => {
                console.error(`Gallery fetch error for ${cat}:`, err);
                return [];
              })
          )
        );

        // 취소된 요청이면 상태 업데이트 안함 (race condition 방지)
        if (isCancelled) return;

        const allFetchedImages = responses.flat() as GalleryImage[];

        // Apply a stable sort: Year ascending, then ID ascending
        const sortedImages = allFetchedImages.sort((a, b) => {
          if (a.eventYear !== b.eventYear) return (a.eventYear || 0) - (b.eventYear || 0);
          return a.id - b.id;
        });

        setImages(sortedImages);
      } catch (error) {
        console.error('Gallery loading error:', error);
      }
    };

    loadImages();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredImages = useMemo(() =>
    filterByEvent(images, selectedFilter),
    [selectedFilter, images]
  );

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
      <SectionHeader
        title="평화의 순간들"
        subtitle="평화를 노래하는 순간들"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <EventFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          colorScheme="ocean"
          filterOrder="gallery"
        />
      </motion.div>

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
            <AnimatePresence mode='popLayout' initial={false}>
              {displayImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ opacity: { duration: 0.3 } }}
                >
                  <GalleryImageItem
                    image={image}
                    priority={index < 8}
                    onClick={setSelectedImage}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {visibleCount < filteredImages.length && (
            <div className="text-center mt-12">
              <Button
                onClick={handleLoadMore}
                variant="outline"
              >
                더 보기
              </Button>
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

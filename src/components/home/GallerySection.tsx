import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { GalleryImage } from '../../types/gallery';
import { getGalleryImages } from '../../api/gallery';
import EventFilter from '../gallery/EventFilter';
import GalleryImageItem from '../gallery/GalleryImageItem';

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

  // Memozied filtering and sorting to prevent re-calculation on every render
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

    // Sort: Year ascending, then ID ascending
    return filtered.sort((a, b) => {
      if (a.eventYear !== b.eventYear) return (a.eventYear || 0) - (b.eventYear || 0);
      return a.id - b.id;
    });
  }, [selectedFilter, images]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedFilter]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  return (
    <section id="gallery" className="section bg-light-beige" ref={ref}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            갤러리
          </h2>
          <p className="text-lg text-gray-600 subtitle">
            평화를 노래하는 순간들 ({filteredImages.length}장)
          </p>
        </motion.div>

        <EventFilter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

        {filteredImages.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-lg">
            <p className="text-xl text-gray-500 font-serif">등록된 사진이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {filteredImages.slice(0, visibleCount).map((image, index) => (
                <GalleryImageItem
                  key={image.id}
                  image={image}
                  index={index}
                  priority={index < 6} // Load first 6 images eagerly
                  isInView={isInView}
                  onClick={setSelectedImage}
                />
              ))}
            </div>

            {visibleCount < filteredImages.length && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-white border-2 border-jeju-ocean text-jeju-ocean rounded-full font-medium hover:bg-jeju-ocean hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  더 보기 ({Math.min(filteredImages.length - visibleCount, 12)}장 남음)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.description || `Gallery image ${selectedImage.id}`}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;

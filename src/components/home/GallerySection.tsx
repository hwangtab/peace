import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GalleryImage } from '../../types/gallery';
import { getGalleryImages } from '../../api/gallery';
import Section from '../layout/Section';

interface GallerySectionProps {
  className?: string;
}

const GallerySection: React.FC<GallerySectionProps> = ({ className }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // ... (rest of the component)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

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

  const displayImages = useMemo(() => {
    return images.slice(0, 8);
  }, [images]);

  return (
    <Section id="gallery" background="seafoam" ref={ref} className={className}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="typo-h2 mb-4 text-gray-900">
            평화의 순간들
          </h2>
          <p className="typo-subtitle mb-8 text-gray-600">
            강정에서 피어난 연대와 환대의 기억
          </p>
          <div className="w-24 h-1 bg-jeju-ocean mx-auto rounded-full mb-12" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]"
        >
          {displayImages.map((image, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300 ${index % 3 === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              onClick={() => setSelectedImage(image)}
              whileHover={{ y: -5 }}
            >
              <img
                src={image.url}
                alt={image.description || 'Gallery Image'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {image.description || 'Gallery Image'}
                </span>
                <span className="text-white/80 text-xs mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {image.eventYear}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-12">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-jeju-ocean border-2 border-jeju-ocean rounded-full font-bold hover:bg-jeju-ocean hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <span>더 많은 사진 보기</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </Section>
  );
};

export default GallerySection;

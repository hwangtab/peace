import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { GalleryImage } from '../../types/gallery';
import { getGalleryImages } from '../../api/gallery';
import EventFilter from '../gallery/EventFilter';

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    const loadImages = async () => {
      const galleryImages = await getGalleryImages();
      // ID가 높은 순서대로 정렬
      const sortedImages = [...galleryImages].sort((a, b) => b.id - a.id);
      setImages(sortedImages);
      setFilteredImages(sortedImages);
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'all') {
      const sortedImages = [...images].sort((a, b) => b.id - a.id);
      setFilteredImages(sortedImages);
    } else if (selectedFilter === 'album-2024') {
      const filtered = images.filter(img => img.eventType === 'album' && img.eventYear === 2024);
      const sortedImages = [...filtered].sort((a, b) => b.id - a.id);
      setFilteredImages(sortedImages);
    } else if (selectedFilter === 'camp-2023') {
      const filtered = images.filter(img => img.eventType === 'camp' && img.eventYear === 2023);
      const sortedImages = [...filtered].sort((a, b) => b.id - a.id);
      setFilteredImages(sortedImages);
    } else if (selectedFilter === 'camp-2025') {
      const filtered = images.filter(img => img.eventType === 'camp' && img.eventYear === 2025);
      const sortedImages = [...filtered].sort((a, b) => b.id - a.id);
      setFilteredImages(sortedImages);
    }
  }, [selectedFilter, images]);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
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
            평화를 노래하는 순간들
          </p>
        </motion.div>

        <EventFilter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="cursor-pointer group"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative overflow-hidden rounded-lg aspect-square">
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                )}
                <img
                  src={image.url}
                  alt={image.description || `Gallery image ${image.id}`}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                    loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  onLoad={() => handleImageLoad(index)}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
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

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getGalleryImages } from '../api/gallery';

interface GalleryImage {
  id: number;
  url: string;
}

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const imageList = await getGalleryImages();
        console.log('Loaded images:', imageList); // 디버그 로그
        setImages(imageList);
      } catch (error) {
        console.error('Error loading gallery images:', error);
      }
    };

    loadImages();
  }, []);

  const handleImageLoad = (src: string) => {
    console.log('Image loaded:', src); // 디버그 로그
    setLoadedImages(prev => [...prev, src]);
  };

  const handleImageError = (src: string) => {
    console.log('Image error:', src); // 디버그 로그
    setImages(prev => prev.filter(img => img.url !== src));
  };

  console.log('Current state:', { images, loadedImages }); // 디버그 로그

  return (
    <div className="pt-24 pb-16 min-h-screen bg-light-beige">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            갤러리
          </h1>
          <p className="text-xl text-gray-600">
            평화를 노래하는 우리들의 순간들
          </p>
        </motion.div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => setSelectedImage(image.url)}
            >
              <img
                src={image.url}
                alt={`Gallery image ${image.id}`}
                onLoad={() => handleImageLoad(image.url)}
                onError={() => handleImageError(image.url)}
                className={`absolute w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
                  loadedImages.includes(image.url) ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full-size image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-7xl max-h-[90vh]"
          >
            <img
              src={selectedImage}
              alt="Selected gallery image"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;

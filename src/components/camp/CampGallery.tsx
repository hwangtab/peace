import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CampEvent } from '../../types/camp';
import Section from '../layout/Section';

interface CampGalleryProps {
  camp: CampEvent;
}

const CampGallery: React.FC<CampGalleryProps> = ({ camp }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!camp.images || camp.images.length === 0) {
    return null;
  }

  return (
    <Section background="ocean-sand">
      <div className="container mx-auto px-4">
        <h2 className="typo-h2 text-center mb-12">갤러리</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {camp.images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer overflow-hidden rounded-xl shadow-lg relative group aspect-video"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                style={{ willChange: 'transform' }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-8 right-8 text-white text-4xl font-light hover:text-jeju-ocean transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
};

export default CampGallery;

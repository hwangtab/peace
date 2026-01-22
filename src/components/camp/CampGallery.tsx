import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CampEvent } from '../../types/camp';
import ImageLightbox from '../common/ImageLightbox';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';

interface CampGalleryProps {
  camp: CampEvent;
}

const CampGallery: React.FC<CampGalleryProps> = ({ camp }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!camp.images || camp.images.length === 0) {
    return null;
  }

  return (
    <Section background="light-beige">
      <div className="container mx-auto px-4">
        <SectionHeader title="갤러리" />
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
                alt={`${camp.year}년 ${camp.title} 갤러리 사진 ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            to={`/gallery?filter=camp-${camp.year}`}
            variant="outline"
          >
            더 보기
          </Button>
        </div>
      </div>

      {selectedImage && (
        <ImageLightbox
          image={{
            url: selectedImage,
            alt: `${camp.year}년 ${camp.title} 갤러리 이미지`
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </Section>
  );
};

export default CampGallery;

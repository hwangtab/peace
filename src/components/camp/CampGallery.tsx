import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CampEvent } from '../../types/camp';
import ImageLightbox from '../common/ImageLightbox';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';

interface CampGalleryProps {
  camp: CampEvent;
}

const CampGallery: React.FC<CampGalleryProps> = ({ camp }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!camp.images || camp.images.length === 0) {
    return null;
  }

  return (
    <Section background="light-beige">
      <div className="container mx-auto px-4">
        <SectionHeader title={t('camp.section_gallery')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {camp.images.map((img, index) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer overflow-hidden rounded-xl shadow-lg relative group aspect-video"
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt={`${camp.year} ${camp.title} ${t('gallery.seo_keywords')} ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority={index < 3}
                loading={index < 3 ? 'eager' : 'lazy'}
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
            {t('camp.more')}
          </Button>
        </div>
      </div>

      {selectedImage && (
        <ImageLightbox
          image={{
            url: selectedImage,
            alt: t('gallery.image_alt_template', { year: camp.year, title: camp.title })
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </Section>
  );
};

export default CampGallery;

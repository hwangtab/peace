import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { GalleryImage } from '@/types/gallery';
import { useGalleryImages } from '@/hooks/useGalleryImages';
import { GALLERY_CONFIG } from '@/constants/config';
import EventFilter from '../common/EventFilter';
import GalleryImageItem from '../gallery/GalleryImageItem';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';

const ImageLightbox = dynamic(() => import('../common/ImageLightbox'), { ssr: false });

interface GallerySectionProps {
  className?: string;
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
  initialImages?: GalleryImage[];
  skipClientFetch?: boolean;
}

const EMPTY_GALLERY_IMAGES: GalleryImage[] = [];

const GallerySection: React.FC<GallerySectionProps> = React.memo(
  ({
    className,
    enableSectionWrapper = true,
    hideSectionHeader = false,
    initialImages = EMPTY_GALLERY_IMAGES,
    skipClientFetch = false,
  }) => {
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    const { filteredImages, selectedFilter, setSelectedFilter } = useGalleryImages(
      initialImages,
      skipClientFetch
    );

    const content = (
      <div
        className={`container mx-auto px-4 sm:px-6 lg:px-8 ${!enableSectionWrapper ? className : ''}`}
      >
        {!hideSectionHeader && (
          <SectionHeader
            title={t('gallery.section_title')}
            subtitle={t('gallery.section_subtitle')}
          />
        )}

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
            <p className="text-xl text-gray-500 font-serif font-bold">{t('gallery.no_images')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <AnimatePresence mode="sync" initial={false}>
              {filteredImages.map((image, index) => (
                <AnimatedGalleryItem
                  key={image.id}
                  image={image}
                  priority={index < GALLERY_CONFIG.PRIORITY_IMAGE_THRESHOLD}
                  onClick={setSelectedImage}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <ImageLightbox
          image={
            selectedImage
              ? {
                  url: selectedImage.url,
                  alt:
                    selectedImage.description ||
                    (selectedImage.eventType === 'camp'
                      ? t('gallery.alt_camp', { year: selectedImage.eventYear })
                      : t('gallery.alt_album', { year: selectedImage.eventYear })),
                }
              : null
          }
          show={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxHeight="85vh"
        />
      </div>
    );

    if (enableSectionWrapper) {
      return (
        <Section id="gallery" background="golden-sun" className={className}>
          {content}
        </Section>
      );
    }

    return content;
  }
);

GallerySection.displayName = 'GallerySection';

const AnimatedGalleryItem: React.FC<{
  image: GalleryImage;
  priority: boolean;
  onClick: (image: GalleryImage) => void;
}> = React.memo(({ image, priority, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25 }}
      layout={false}
      className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden"
    >
      <GalleryImageItem image={image} priority={priority} onClick={onClick} />
    </motion.div>
  );
});

AnimatedGalleryItem.displayName = 'AnimatedGalleryItem';

export default GallerySection;

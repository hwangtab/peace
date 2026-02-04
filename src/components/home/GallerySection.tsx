import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GalleryImage } from '../../types/gallery';
import { useGalleryImages } from '../../hooks/useGalleryImages';
import { GALLERY_CONFIG } from '../../constants/config';
import EventFilter from '../common/EventFilter';
import GalleryImageItem from '../gallery/GalleryImageItem';
import ImageLightbox from '../common/ImageLightbox';
import Section from '../layout/Section';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';

interface GallerySectionProps {
  className?: string;
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = React.memo(({
  className,
  enableSectionWrapper = true,
  hideSectionHeader = false
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const {
    displayImages,
    filteredImages,
    selectedFilter,
    setSelectedFilter,
    hasMore,
    loadMore,
  } = useGalleryImages();

  const content = (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${!enableSectionWrapper ? className : ''}`}>
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
          <p className="text-xl text-gray-500 font-serif">{t('gallery.no_images')}</p>
        </div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
          >
            <AnimatePresence mode='popLayout' initial={false}>
              {displayImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                >
                  <GalleryImageItem
                    image={image}
                    priority={index < GALLERY_CONFIG.PRIORITY_IMAGE_THRESHOLD}
                    onClick={setSelectedImage}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {hasMore && (
            <div className="text-center mt-12">
              <Button
                onClick={loadMore}
                variant="outline"
              >
                {t('gallery.load_more')}
              </Button>
            </div>
          )}
        </>
      )}

      {selectedImage && (
        <ImageLightbox
          image={{
            url: selectedImage.url,
            alt: selectedImage.description ||
              `${selectedImage.eventYear || ''}${t('gallery.image_alt_fallback')}`
          }}
          onClose={() => setSelectedImage(null)}
          maxHeight="85vh"
        />
      )}
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
});

GallerySection.displayName = 'GallerySection';

export default GallerySection;

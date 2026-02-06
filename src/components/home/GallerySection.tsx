import React, { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { GalleryImage } from '../../types/gallery';
import { useGalleryImages } from '../../hooks/useGalleryImages';
import { GALLERY_CONFIG } from '../../constants/config';
import EventFilter from '../common/EventFilter';
import GalleryImageItem from '../gallery/GalleryImageItem';
import ImageLightbox from '../common/ImageLightbox';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';

interface GallerySectionProps {
  className?: string;
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
  initialImages?: GalleryImage[];
}

const GallerySection: React.FC<GallerySectionProps> = React.memo(({
  className,
  enableSectionWrapper = true,
  hideSectionHeader = false,
  initialImages = []
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const {
    displayImages,
    filteredImages,
    selectedFilter,
    setSelectedFilter,
  } = useGalleryImages(initialImages);

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
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
        >
          <AnimatePresence mode='popLayout' initial={false}>
            {displayImages.map((image, index) => (
              <VirtualGalleryItem
                key={image.id}
                image={image}
                priority={index < GALLERY_CONFIG.PRIORITY_IMAGE_THRESHOLD}
                onClick={setSelectedImage}
              />
            ))}
          </AnimatePresence>
        </motion.div>
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

/**
 * Sub-component for virtualized gallery rendering.
 * Only renders the actual content when in or near the viewport.
 */
const VirtualGalleryItem: React.FC<{
  image: GalleryImage;
  priority: boolean;
  onClick: (image: GalleryImage) => void;
}> = React.memo(({ image, priority, onClick }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "200px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="aspect-[4/3] relative bg-gray-100 rounded-lg overflow-hidden"
    >
      {isInView && (
        <GalleryImageItem
          image={image}
          priority={priority}
          onClick={onClick}
        />
      )}
    </motion.div>
  );
});

VirtualGalleryItem.displayName = 'VirtualGalleryItem';

export default GallerySection;

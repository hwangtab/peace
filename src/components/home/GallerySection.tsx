import React, { useState } from 'react';
import { m as motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { GalleryImage } from '@/types/gallery';
import { useGalleryImages } from '@/hooks/useGalleryImages';
import { GALLERY_CONFIG } from '@/constants/config';
import Link from 'next/link';
import EventFilter from '../common/EventFilter';
import GalleryImageItem from '../gallery/GalleryImageItem';
import PhotographerIntro from '../gallery/PhotographerIntro';
import { getPhotographersForFilter, photographerNameKey } from '@/data/photographers';
import Section from '../layout/Section';
import Container from '../layout/Container';
import SectionHeader from '../common/SectionHeader';
import ImageLightbox, { LightboxImage } from '../common/ImageLightbox';

interface GallerySectionProps {
  className?: string;
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
  initialImages?: GalleryImage[];
  skipClientFetch?: boolean;
  /**
   * 첫 N개 타일에 next/image priority 를 부여할지. true (기본)면
   * /gallery 처럼 갤러리가 above-the-fold 인 페이지에 적합.
   * /home 처럼 fold 아래에 있으면 false 로 — preload 가 LCP H1 렌더와
   * 우선순위 경쟁해 element render delay (~2.5s) 를 일으킴.
   */
  priorityFirstImages?: boolean;
}

const EMPTY_GALLERY_IMAGES: GalleryImage[] = [];

const GallerySection: React.FC<GallerySectionProps> = React.memo(
  ({
    className,
    enableSectionWrapper = true,
    hideSectionHeader = false,
    initialImages = EMPTY_GALLERY_IMAGES,
    skipClientFetch = false,
    priorityFirstImages = true,
  }) => {
    const { t, i18n } = useTranslation();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const { filteredImages, selectedFilter, setSelectedFilter } = useGalleryImages(
      initialImages,
      skipClientFetch,
      i18n.language
    );

    const content = (
      <Container size="wide" className={!enableSectionWrapper ? className : undefined}>
        {!hideSectionHeader && (
          <SectionHeader
            title={t('gallery.section_title')}
            subtitle={t('gallery.section_subtitle')}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <EventFilter
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            colorScheme="ocean"
            filterOrder="gallery"
          />
        </motion.div>

        <PhotographerIntro photographers={getPhotographersForFilter(selectedFilter)} />

        {filteredImages.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-lg">
            <p className="text-xl text-coastal-gray font-serif font-bold">
              {t('gallery.no_images')}
            </p>
          </div>
        ) : (
          <div
            key={selectedFilter}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
          >
            {filteredImages.map((image, idx) => (
              <AnimatedGalleryItem
                key={image.url}
                image={image}
                priority={priorityFirstImages && idx < GALLERY_CONFIG.PRIORITY_IMAGE_THRESHOLD}
                imageIndex={idx}
                onClick={setSelectedIndex}
              />
            ))}
          </div>
        )}

        {enableSectionWrapper && (
          <div className="text-center mb-8">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1 text-deep-ocean hover:text-jeju-ocean font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded"
            >
              {t('nav.gallery')} →
            </Link>
          </div>
        )}

        <ImageLightbox
          show={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          maxHeight="85vh"
          images={filteredImages.map(
            (img): LightboxImage => ({
              src: img.url,
              alt:
                img.description ||
                (img.eventType === 'camp'
                  ? t('gallery.alt_camp', { year: img.eventYear })
                  : t('gallery.alt_album', { year: img.eventYear })),
              credit: img.photographer
                ? t('gallery.photo_credit', {
                    name: t(photographerNameKey(img.photographer)),
                  })
                : undefined,
            })
          )}
          index={selectedIndex ?? 0}
          onIndexChange={setSelectedIndex}
        />
      </Container>
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
  imageIndex: number;
  onClick: (idx: number) => void;
}> = React.memo(({ image, priority, imageIndex, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="aspect-square relative bg-ocean-sand rounded-lg overflow-hidden"
    >
      <GalleryImageItem image={image} priority={priority} onClick={(_img) => onClick(imageIndex)} />
    </motion.div>
  );
});

AnimatedGalleryItem.displayName = 'AnimatedGalleryItem';

export default GallerySection;

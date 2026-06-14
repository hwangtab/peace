import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import { CampEvent } from '@/types/camp';
import Container from '../layout/Container';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import ImageLightbox from '../common/ImageLightbox';
import { photographersByYear, photographerNameKey } from '@/data/photographers';

interface CampGalleryProps {
  camp: CampEvent;
}

const CampGallery: React.FC<CampGalleryProps> = ({ camp }) => {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!camp.images || camp.images.length === 0) {
    return null;
  }

  // 해당 연도에 등록된 사진 작가가 있으면 크레딧을 노출한다 (제3회/2026 부터).
  const photographers = photographersByYear[camp.year] ?? [];
  const creditNames = photographers.map((p) => t(photographerNameKey(p.slug))).join(', ');
  const creditText = creditNames ? t('gallery.photo_credit', { name: creditNames }) : undefined;

  const fallbackAlt = t('gallery.alt_camp', { year: camp.year, title: camp.title });
  const altForIndex = (index: number): string => {
    const key = `camp_data.${camp.id}.image_alts.${index}`;
    return i18n.exists(key) ? t(key) : fallbackAlt;
  };

  return (
    <Section background="light-beige">
      <Container size="wide">
        <SectionHeader title={t('camp.section_gallery')} subtitle={creditText} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {camp.images.map((img, index) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="cursor-pointer overflow-hidden rounded-xl shadow-lg relative group aspect-video focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
              role="button"
              aria-label={`${t('common.view_image') || 'View image'} ${index + 1}`}
              tabIndex={0}
              onClick={() => setSelectedImage(img)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedImage(img);
                }
              }}
            >
              <Image
                src={img}
                alt={altForIndex(index)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority={index < 3}
                {...(index >= 3 ? { loading: 'lazy' as const } : {})}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button to={`/gallery?filter=camp-${camp.year}`} variant="outline">
            {t('camp.more')}
          </Button>
        </div>
      </Container>

      <ImageLightbox
        image={
          selectedImage
            ? {
                url: selectedImage,
                alt: t('gallery.image_alt_template', { year: camp.year, title: camp.title }),
                credit: creditText,
              }
            : null
        }
        show={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </Section>
  );
};

export default CampGallery;

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import { CampEvent } from '@/types/camp';
import Container from '../layout/Container';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import Link from 'next/link';
import Button from '../common/Button';
import dynamic from 'next/dynamic';
import type { LightboxImage } from '../common/ImageLightbox';
// 라이트박스는 클릭 시점에만 필요 — 초기 번들에서 분리.
const ImageLightbox = dynamic(() => import('../common/ImageLightbox'), { ssr: false });
import WidgetErrorBoundary from '../common/WidgetErrorBoundary';
import { photographersByYear, photographerNameKey } from '@/data/photographers';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type PaddingLevel = 'none' | 'tight' | 'normal' | 'loose';

interface CampGalleryProps {
  camp: CampEvent;
  paddingTop?: PaddingLevel;
  paddingBottom?: PaddingLevel;
}

const CampGallery: React.FC<CampGalleryProps> = ({
  camp,
  paddingTop = 'normal',
  paddingBottom = 'normal',
}) => {
  const { t, i18n } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { viewport, itemTransition } = useScrollReveal();

  if (!camp.images || camp.images.length === 0) {
    return null;
  }

  // 해당 연도에 등록된 사진 작가가 있으면 크레딧을 노출한다 (제3회/2026 부터).
  const photographers = photographersByYear[camp.year] ?? [];
  const creditNames = photographers.map((p) => t(photographerNameKey(p.slug))).join(', ');
  const creditText = creditNames ? t('gallery.photo_credit', { name: creditNames }) : undefined;
  // 작가가 1명이면 크레딧을 작가 페이지로 연결한다.
  const singlePhotographer = photographers.length === 1 ? photographers[0] : undefined;
  const creditNode =
    creditText && singlePhotographer ? (
      <Link
        href={`/photographers/${singlePhotographer.slug}`}
        className="underline underline-offset-2 hover:text-jeju-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm"
      >
        {creditText}
      </Link>
    ) : (
      creditText
    );

  const fallbackAlt = t('gallery.alt_camp', { year: camp.year, title: camp.title });
  const altForIndex = (index: number): string => {
    const key = `camp_data.${camp.id}.image_alts.${index}`;
    return i18n.exists(key) ? t(key) : fallbackAlt;
  };

  return (
    <Section background="light-beige" paddingTop={paddingTop} paddingBottom={paddingBottom}>
      <Container size="wide">
        <SectionHeader title={t('camp.section_gallery')} subtitle={creditNode} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {camp.images.map((img, idx) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={itemTransition()}
              className="cursor-pointer overflow-hidden rounded-xl shadow-lg relative group aspect-video focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
              role="button"
              aria-label={`${t('common.view_image', { defaultValue: 'View image' })} ${idx + 1}`}
              tabIndex={0}
              onClick={() => setSelectedIndex(idx)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIndex(idx);
                }
              }}
            >
              <Image
                src={img}
                alt={altForIndex(idx)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
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

      {/* 라이트박스 격리(D2): 렌더 예외가 갤러리 전체를 덮지 않도록. */}
      <WidgetErrorBoundary>
        <ImageLightbox
          show={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          images={camp.images.map(
            (img, idx): LightboxImage => ({
              src: img,
              alt: altForIndex(idx),
              credit: creditText,
            })
          )}
          index={selectedIndex ?? 0}
          onIndexChange={setSelectedIndex}
        />
      </WidgetErrorBoundary>
    </Section>
  );
};

export default CampGallery;

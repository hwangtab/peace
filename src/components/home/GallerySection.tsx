import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { useScrollReveal } from '@/hooks/useScrollReveal';
import dynamic from 'next/dynamic';
import type { LightboxImage } from '../common/ImageLightbox';
// 라이트박스는 클릭 시점에만 필요 — 초기 번들에서 분리.
const ImageLightbox = dynamic(() => import('../common/ImageLightbox'), { ssr: false });

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
    const { viewport, item } = useScrollReveal();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const { filteredImages, selectedFilter, setSelectedFilter } = useGalleryImages(
      initialImages,
      skipClientFetch,
      i18n.language
    );

    // 점진 렌더(무한 스크롤): 전체 갤러리는 수천 장이라 한 번에 마운트하면 DOM이
    // 폭증한다. 보이는 만큼만 렌더하고 sentinel 이 뷰포트에 들어오면 더 로드한다.
    // 필터 전환 시 처음으로 리셋. 미리보기(홈)는 length 가 작아 sentinel 이 없다.
    const [visibleCount, setVisibleCount] = useState<number>(GALLERY_CONFIG.INITIAL_VISIBLE_COUNT);

    useEffect(() => {
      setVisibleCount(GALLERY_CONFIG.INITIAL_VISIBLE_COUNT);
    }, [selectedFilter]);

    // callback ref 패턴: sentinel DOM 노드가 부착/분리되는 시점에 IntersectionObserver를
    // 연결/해제한다. useRef + useEffect(deps=[length]) 조합에서는 필터 전환으로
    // visibleCount 가 리셋되고 sentinel 이 언마운트→리마운트될 때, 새 목록 length 가
    // 이전과 같으면 effect 가 재실행되지 않아 새 DOM 노드에 observer 가 안 붙는 회귀가
    // 있었다. callback ref 는 length 변화와 무관하게 항상 올바르게 재부착된다.
    const filteredImagesLengthRef = useRef(filteredImages.length);
    useEffect(() => {
      filteredImagesLengthRef.current = filteredImages.length;
    }, [filteredImages.length]);

    // 활성 observer 를 ref 에 보관해, sentinel 이 언마운트(el === null)될 때 해제한다.
    const sentinelObserverRef = useRef<IntersectionObserver | null>(null);

    const sentinelRef = useCallback((el: HTMLDivElement | null) => {
      // 이전 observer 해제 (언마운트 또는 재부착 시)
      sentinelObserverRef.current?.disconnect();
      sentinelObserverRef.current = null;
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setVisibleCount((c) =>
              Math.min(c + GALLERY_CONFIG.LOAD_STEP, filteredImagesLengthRef.current)
            );
          }
        },
        { rootMargin: '800px' }
      );
      observer.observe(el);
      sentinelObserverRef.current = observer;
    }, []);

    const visibleImages = filteredImages.slice(0, visibleCount);
    const hasMore = visibleCount < filteredImages.length;

    // 라이트박스 이미지 배열 — 필터·언어 변경 시에만 재계산 (열려있을 때만 사용됨).
    const lightboxImages = useMemo<LightboxImage[]>(
      () =>
        filteredImages.map((img) => ({
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
        })),
      [filteredImages, t]
    );

    const content = (
      <Container size="wide" className={!enableSectionWrapper ? className : undefined}>
        {!hideSectionHeader && (
          <SectionHeader
            title={t('gallery.section_title')}
            subtitle={t('gallery.section_subtitle')}
          />
        )}

        <motion.div variants={item} initial="hidden" whileInView="visible" viewport={viewport}>
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
          <>
            <div
              key={selectedFilter}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
            >
              {visibleImages.map((image, idx) => (
                <AnimatedGalleryItem
                  key={image.url}
                  image={image}
                  priority={priorityFirstImages && idx < GALLERY_CONFIG.PRIORITY_IMAGE_THRESHOLD}
                  imageIndex={idx}
                  onClick={setSelectedIndex}
                />
              ))}
            </div>
            {/* 무한 스크롤 sentinel — 남은 이미지가 있을 때만 렌더 */}
            {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />}
          </>
        )}

        {enableSectionWrapper && (
          <div className="text-center mb-8">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1 text-deep-ocean hover:text-jeju-ocean font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded"
            >
              {t('nav.gallery')} <span className="inline-block rtl:-scale-x-100">→</span>
            </Link>
          </div>
        )}

        <ImageLightbox
          show={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          maxHeight="85vh"
          images={lightboxImages}
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
  // imageIndex를 클로저로 고정해 GalleryImageItem memo가 무력화되지 않도록.
  // GalleryImageItem은 image 인자를 넘기지만 여기선 index로만 처리한다.
  const handleClick = useCallback(
    (_img: Pick<GalleryImage, 'url' | 'description' | 'eventType' | 'eventYear'>) =>
      onClick(imageIndex),
    [onClick, imageIndex]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="aspect-square relative bg-ocean-sand rounded-lg overflow-hidden"
    >
      <GalleryImageItem image={image} priority={priority} onClick={handleClick} />
    </motion.div>
  );
});

AnimatedGalleryItem.displayName = 'AnimatedGalleryItem';

export default GallerySection;

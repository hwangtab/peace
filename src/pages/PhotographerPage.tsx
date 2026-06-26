import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';
import Button from '@/components/common/Button';
import GalleryImageItem from '@/components/gallery/GalleryImageItem';
import dynamic from 'next/dynamic';
import type { LightboxImage } from '@/components/common/ImageLightbox';
// 라이트박스는 클릭 시점에만 필요 — 초기 번들에서 분리.
const ImageLightbox = dynamic(() => import('@/components/common/ImageLightbox'), { ssr: false });
import { GalleryImage } from '@/types/gallery';
import { photographerNameKey, findPhotographer } from '@/data/photographers';
import {
  getImageGallerySchema,
  getBreadcrumbSchema,
  getWebPageSchema,
} from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { GALLERY_CONFIG } from '@/constants/config';

/**
 * getStaticProps 에서 내려오는 슬림 이미지 타입.
 * GalleryImageItem 이 실제로 읽는 필드(url, description, eventType, eventYear)만 포함.
 * id·photographer 는 이 페이지에서 사용하지 않아 제외했다.
 */
export type SlimGalleryImage = Pick<
  GalleryImage,
  'url' | 'description' | 'eventType' | 'eventYear'
>;

interface PhotographerPageProps {
  slug: string;
  images: SlimGalleryImage[];
}

const FALLBACK_HERO = '/images-webp/camps/2026/kdh-DSC08498.webp';

const PhotographerPage: React.FC<PhotographerPageProps> = ({ slug, images }) => {
  const { t, i18n } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const name = t(photographerNameKey(slug));
  const bio = t(`gallery.photographers.${slug}.bio`);
  const credit = t('gallery.photo_credit', { name });
  const profileImage = findPhotographer(slug)?.image;
  const heroImage = profileImage || images[0]?.url || FALLBACK_HERO;

  // 점진 렌더(무한 스크롤): GallerySection 과 동일한 callback ref 패턴.
  // 초기에 INITIAL_VISIBLE_COUNT 장만 DOM에 마운트하고, 사용자가 스크롤해
  // sentinel 이 뷰포트에 가까워지면 LOAD_STEP 단위로 늘린다.
  // callback ref 로 전환해 sentinel 재마운트 시 항상 observer 가 올바르게 재부착되도록 한다.
  const [visibleCount, setVisibleCount] = useState<number>(GALLERY_CONFIG.INITIAL_VISIBLE_COUNT);

  const imagesLengthRef = useRef(images.length);
  useEffect(() => {
    imagesLengthRef.current = images.length;
  }, [images.length]);

  const sentinelObserverRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback((el: HTMLDivElement | null) => {
    sentinelObserverRef.current?.disconnect();
    sentinelObserverRef.current = null;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + GALLERY_CONFIG.LOAD_STEP, imagesLengthRef.current));
        }
      },
      { rootMargin: '800px' }
    );
    observer.observe(el);
    sentinelObserverRef.current = observer;
  }, []);

  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  // 라이트박스 클릭: 그리드는 visibleImages 슬라이스를 렌더하지만, 인덱스는
  // 전체 images 배열 기준이어야 네비게이션이 올바르다.
  // slice(0, visibleCount) 이므로 그리드 내 idx === 전체 배열 기준 idx — 일치.
  // GalleryImageItem 의 onClick 시그니처에 맞추되, 실제로는 캡처된 idx 만 사용한다.
  // _img 인자는 버리고 전체 배열 기준 idx 로 setSelectedIndex 를 호출한다.
  const handleImageClick = useCallback(
    (idx: number) => (_img: SlimGalleryImage) => setSelectedIndex(idx),
    []
  );

  const breadcrumbs = useMemo(
    () => [
      { name: t('nav.home'), url: getFullUrl('/') },
      { name: t('gallery.page_title'), url: getFullUrl('/gallery') },
      { name, url: getFullUrl(`/photographers/${slug}`) },
    ],
    [t, name, slug]
  );

  // structuredData 는 img.url 만 사용 — SlimGalleryImage 와 호환.
  const structuredData = useMemo(() => {
    const schemaImages = images.slice(0, 20).map((img) => ({
      url: getFullUrl(img.url),
      caption: credit,
    }));
    return [
      getImageGallerySchema(schemaImages, i18n.language, t, images.length),
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('gallery.photographer_page_title', { name }),
        description: bio,
        url: getFullUrl(`/photographers/${slug}`),
      }),
    ];
  }, [images, credit, i18n.language, t, breadcrumbs, name, bio, slug]);

  // 라이트박스 이미지 배열 — 전체 images 기준이어야 네비게이션이 깨지지 않는다.
  const lightboxImages = useMemo<LightboxImage[]>(
    () =>
      images.map(
        (img): LightboxImage => ({
          src: img.url,
          alt: img.description || credit,
          credit,
        })
      ),
    [images, credit]
  );

  return (
    <PageLayout
      title={t('gallery.photographer_page_title', { name })}
      description={bio}
      ogImage={heroImage}
      ogImageAlt={name}
      background="golden-sun"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <PageHero
        title={name}
        subtitle={t('gallery.photographers_heading')}
        backgroundImage={heroImage}
      />

      <Section background="white" paddingTop="normal" paddingBottom="tight">
        <Container size="content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-jeju-ocean font-bold mb-3">
              {t('gallery.photographers_heading')}
            </p>
            <h2 className="typo-h3 text-deep-ocean mb-4">{name}</h2>
            <p className="typo-body text-coastal-gray whitespace-pre-line break-words max-w-2xl">
              {bio}
            </p>
          </motion.div>
        </Container>
      </Section>

      <Section background="white" paddingTop="tight" paddingBottom="loose">
        <Container size="wide">
          {images.length === 0 ? (
            <p className="text-center text-coastal-gray py-16">{t('gallery.no_images')}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleImages.map((image, idx) => (
                  <div
                    key={image.url}
                    className="aspect-square relative bg-ocean-sand rounded-lg overflow-hidden"
                  >
                    <GalleryImageItem
                      image={image}
                      priority={idx < 4}
                      onClick={handleImageClick(idx)}
                    />
                  </div>
                ))}
              </div>
              {/* 무한 스크롤 sentinel — 남은 이미지가 있을 때만 렌더 */}
              {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />}
            </>
          )}

          <div className="text-center mt-12">
            <Button to={`/gallery?filter=camp-${images[0]?.eventYear ?? 2026}`} variant="outline">
              {t('gallery.photographer_back')}
            </Button>
          </div>
        </Container>
      </Section>

      <ImageLightbox
        show={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        maxHeight="85vh"
        images={lightboxImages}
        index={selectedIndex ?? 0}
        onIndexChange={setSelectedIndex}
      />
    </PageLayout>
  );
};

export default PhotographerPage;

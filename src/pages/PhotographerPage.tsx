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
import WidgetErrorBoundary from '@/components/common/WidgetErrorBoundary';
import { GalleryImage } from '@/types/gallery';
import { photographerNameKey, findPhotographer, photographersByYear } from '@/data/photographers';
import {
  getGalleryImagesByCategories,
  GALLERY_CATEGORIES,
  type GalleryCategory,
} from '@/api/gallery';
import {
  getImageGallerySchema,
  getBreadcrumbSchema,
  getWebPageSchema,
} from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { GALLERY_CONFIG } from '@/constants/config';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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
  /** SSR 첫 페인트용 상단 프리뷰(60장). 마운트 후 클라이언트가 전량으로 교체 */
  initialImages: SlimGalleryImage[];
  /** 작가의 전체 이미지 수 — schema numberOfItems 정확도용(SSR 시점) */
  totalImageCount: number;
}

const FALLBACK_HERO = '/images-webp/camps/2026/kdh-DSC08498.webp';

// 연도 → gallery JSON 카테고리. photographersByYear 의 연도 키를 fetch 대상
// 카테고리로 환원한다.
const CATEGORY_BY_YEAR: Partial<Record<number, GalleryCategory>> = {
  2023: 'camp2023',
  2024: 'album',
  2025: 'camp2025',
  2026: 'camp2026',
};

// 작가가 등록된 연도로부터 fetch 할 카테고리를 도출한다. 현재 작가 태그는 전부
// camp2026 에만 있어 통상 1개 카테고리만 받는다. 매핑되지 않는 연도가 섞이면
// 정확성을 위해 전체 카테고리를 받아 필터한다.
const categoriesForPhotographer = (slug: string): GalleryCategory[] => {
  const cats = new Set<GalleryCategory>();
  let hasUnmapped = false;
  for (const [year, list] of Object.entries(photographersByYear)) {
    if (!list.some((p) => p.slug === slug)) continue;
    const cat = CATEGORY_BY_YEAR[Number(year)];
    if (cat) cats.add(cat);
    else hasUnmapped = true;
  }
  if (hasUnmapped || cats.size === 0) return [...GALLERY_CATEGORIES];
  return [...cats];
};

// getStaticProps 와 동일한 필터·정렬·슬림 매핑. SSR 프리뷰와 클라이언트 전량이
// 같은 순서를 갖도록 로직을 일치시킨다.
const toSlimForPhotographer = (all: GalleryImage[], slug: string): SlimGalleryImage[] =>
  all
    .filter((img) => img.photographer === slug)
    .sort((a, b) => {
      if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
      return b.id - a.id;
    })
    .map(({ url, description, eventType, eventYear }) => ({
      url,
      ...(description !== undefined && { description }),
      eventType,
      eventYear,
    }));

const PhotographerPage: React.FC<PhotographerPageProps> = ({
  slug,
  initialImages,
  totalImageCount,
}) => {
  const { t, i18n } = useTranslation();
  const { item, viewport } = useScrollReveal();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 초기엔 SSR 프리뷰(60장)만 보유하고, 마운트 후 전량으로 교체한다.
  const [images, setImages] = useState<SlimGalleryImage[]>(initialImages);

  // 클라이언트 지연 로드: gallery.tsx 와 동일 패턴. 마운트 후 작가의 카테고리
  // JSON 을 fetch → 작가 필터 → 전량으로 교체. slug/프리뷰 변경(작가 페이지 간
  // 이동) 시 프리뷰로 리셋한 뒤 다시 받는다.
  useEffect(() => {
    let cancelled = false;
    setImages(initialImages);
    (async () => {
      try {
        const all = await getGalleryImagesByCategories(categoriesForPhotographer(slug));
        if (cancelled) return;
        const slim = toSlimForPhotographer(all, slug);
        if (slim.length > 0) setImages(slim);
      } catch (error) {
        console.error('Failed to load photographer images:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, initialImages]);

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
      // numberOfItems 는 전체 개수(totalImageCount)로 — SSR 시점엔 images 가
      // 프리뷰 60장뿐이라 images.length 를 쓰면 개수가 과소 집계된다.
      getImageGallerySchema(schemaImages, i18n.language, t, totalImageCount),
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('gallery.photographer_page_title', { name }),
        description: bio,
        url: getFullUrl(`/photographers/${slug}`),
      }),
    ];
  }, [images, credit, i18n.language, t, breadcrumbs, name, bio, slug, totalImageCount]);

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
          <motion.div variants={item} initial="hidden" whileInView="visible" viewport={viewport}>
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

      {/* 라이트박스 격리(D2): 렌더 예외가 페이지 전체를 덮지 않도록. */}
      <WidgetErrorBoundary>
        <ImageLightbox
          show={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          maxHeight="85vh"
          images={lightboxImages}
          index={selectedIndex ?? 0}
          onIndexChange={setSelectedIndex}
        />
      </WidgetErrorBoundary>
    </PageLayout>
  );
};

export default PhotographerPage;

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { getVideos } from '@/api/videos';
import { VideoItem } from '@/types/video';
import { filterByEvent } from '@/utils/filtering';
import { useFilterFromQuery } from '@/hooks/useFilterFromQuery';
import { sortByDateDesc } from '@/utils/sorting';
import { VIDEOS_CONFIG } from '@/constants/config';
import EventFilter from '../common/EventFilter';
import PageLayout from '../layout/PageLayout';
import PageHero from '../common/PageHero';
import PageIntroSection from '../common/PageIntroSection';
import Container from '../layout/Container';
import VideoCard from './VideoCard';
import {
  getCollectionPageSchema,
  getBreadcrumbSchema,
  getVideoObjectSchema,
  getWebPageSchema,
} from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface VideoPageProps {
  initialVideos?: VideoItem[];
  initialLocale?: string;
}

export default function VideoPage({ initialVideos = [], initialLocale = 'ko' }: VideoPageProps) {
  const { t, i18n } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useFilterFromQuery();

  const fetchVideos = useCallback((locale: string) => getVideos(locale), []);
  const videosResource = useLocalizedResource<VideoItem>({
    initialData: initialVideos,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchVideos,
  });

  const videos = videosResource.data;

  const filteredVideos = useMemo(
    () => sortByDateDesc(filterByEvent(videos, selectedFilter)),
    [videos, selectedFilter]
  );

  // 점진 렌더(무한 스크롤): 첫 화면 분량만 카드로 SSR/마운트하고, 나머지는
  // 스크롤 도달 시 카드로 승격한다. 필터 전환 시 처음으로 리셋.
  // (갤러리 GallerySection 의 sentinel + IntersectionObserver 패턴을 재사용)
  const [visibleCount, setVisibleCount] = useState<number>(VIDEOS_CONFIG.INITIAL_VISIBLE_COUNT);

  // 필터 전환 시 렌더 도중 리셋 — 별도 effect 대신 React 권장 "prop 변화 시 렌더 중
  // state 조정" 패턴으로 cascading render 를 회피한다.
  const [prevFilter, setPrevFilter] = useState(selectedFilter);
  if (selectedFilter !== prevFilter) {
    setPrevFilter(selectedFilter);
    setVisibleCount(VIDEOS_CONFIG.INITIAL_VISIBLE_COUNT);
  }

  // callback ref 패턴: 필터 전환으로 sentinel 이 언마운트→리마운트될 때 새 길이가
  // 이전과 같아도 항상 observer 를 올바르게 재부착한다(길이 deps effect 의 회귀 방지).
  const filteredVideosLengthRef = useRef(filteredVideos.length);
  useEffect(() => {
    filteredVideosLengthRef.current = filteredVideos.length;
  }, [filteredVideos.length]);

  const sentinelObserverRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback((el: HTMLDivElement | null) => {
    sentinelObserverRef.current?.disconnect();
    sentinelObserverRef.current = null;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) =>
            Math.min(c + VIDEOS_CONFIG.LOAD_STEP, filteredVideosLengthRef.current)
          );
        }
      },
      { rootMargin: '800px' }
    );
    observer.observe(el);
    sentinelObserverRef.current = observer;
  }, []);

  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const remainingVideos = filteredVideos.slice(visibleCount);
  const hasMore = visibleCount < filteredVideos.length;

  const videoBreadcrumbs = useMemo(
    () => [
      { name: t('nav.home'), url: getFullUrl('/') },
      { name: t('videos.page_title'), url: getFullUrl('/videos') },
    ],
    [t]
  );

  const structuredData = useMemo(() => {
    const eligibleVideos = videos.filter((v) => v.youtubeUrl && v.date).slice(0, 10);
    const videoSchemas = eligibleVideos
      .map((v) =>
        getVideoObjectSchema(
          {
            name: v.title,
            description: v.description || '',
            youtubeUrl: v.youtubeUrl,
            uploadDate: v.date,
            id: String(v.id),
            duration: v.duration,
            pageUrl: getFullUrl(`/videos/${v.id}`),
          },
          t
        )
      )
      .filter((schema): schema is NonNullable<typeof schema> => schema !== null);
    const collectionSchema = getCollectionPageSchema({
      name: t('videos.page_title'),
      description: t('videos.page_desc'),
      url: getFullUrl('/videos'),
      hasPart: eligibleVideos.map((v) => ({
        '@id': `https://peaceandmusic.net/videos/${v.id}#video`,
      })),
    });
    return [
      collectionSchema,
      getBreadcrumbSchema(videoBreadcrumbs),
      getWebPageSchema({
        name: t('videos.page_title'),
        description: t('videos.page_desc'),
        url: getFullUrl('/videos'),
        keywords: [
          '강정피스앤뮤직캠프 영상',
          'Gangjeong Peace Music Camp videos',
          '라이브 영상',
          'live performance videos',
          '인디 음악 영상',
          'Korean indie videos',
          '평화음악 공연',
          'peace music performances',
        ],
      }),
      ...videoSchemas,
    ];
  }, [videos, t, videoBreadcrumbs]);

  return (
    <PageLayout
      title={t('videos.page_title')}
      description={t('videos.page_desc')}
      ogImage="/images/og/peace-camp-og.jpg"
      ogImageAlt={t('videos.page_title')}
      ogType="video.other"
      background="sunlight-glow"
      structuredData={structuredData}
      breadcrumbs={videoBreadcrumbs}
      disableTopPadding={true}
    >
      <PageHero
        title={t('videos.hero_title')}
        subtitle={t('videos.hero_subtitle')}
        backgroundImage="/images-webp/camps/2023/IMG_2064.webp"
      />

      <PageIntroSection
        eyebrow={t('videos.intro.eyebrow')}
        heading={t('videos.intro.heading')}
        paragraphs={[t('videos.intro.p1'), t('videos.intro.p2'), t('videos.intro.p3')]}
        background="white"
      />

      <Container size="wide" className="pt-12">
        <EventFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          colorScheme="ocean"
          filterOrder="videos"
        />

        {videosResource.isLoading && (
          <p className="text-center text-coastal-gray py-12" role="status">
            {t('common.loading')}
          </p>
        )}
        {videosResource.error && (
          <p className="text-center text-coastal-gray py-12" role="alert">
            {t('common.no_results')}
          </p>
        )}
        {!videosResource.error && !videosResource.isLoading && filteredVideos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleVideos.map((video) => (
                <div key={video.id} className="h-full">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
            {hasMore && (
              <>
                {/* 무한 스크롤 sentinel — 뷰포트 접근 시 다음 묶음을 카드로 승격 */}
                <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
                {/* SEO 보존: 아직 카드로 마운트되지 않은 나머지 영상도 크롤러가
                    상세 링크를 볼 수 있도록 초경량 텍스트 링크로 SSR 한다(CSS 숨김 없음).
                    스크롤 도달 시 위 그리드의 카드로 승격되어 사용자에겐 카드로 보인다. */}
                <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
                  {remainingVideos.map((video) => (
                    <li key={video.id} className="leading-snug">
                      <Link
                        href={`/videos/${video.id}`}
                        className="text-sm text-coastal-gray hover:text-jeju-ocean underline-offset-2 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
                      >
                        {video.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
        {filteredVideos.length === 0 && !videosResource.error && !videosResource.isLoading && (
          <p className="text-center text-coastal-gray py-12">
            {t('common.no_results') || 'No results found.'}
          </p>
        )}
      </Container>
    </PageLayout>
  );
}

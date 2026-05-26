import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { getVideos } from '@/api/videos';
import { VideoItem } from '@/types/video';
import { filterByEvent } from '@/utils/filtering';
import { useFilterFromQuery } from '@/hooks/useFilterFromQuery';
import { sortByDateDesc } from '@/utils/sorting';
import EventFilter from '../common/EventFilter';
import PageLayout from '../layout/PageLayout';
import PageHero from '../common/PageHero';
import PageIntroSection from '../common/PageIntroSection';
import Container from '../layout/Container';
import VideoCard from './VideoCard';
import { getCollectionPageSchema, getBreadcrumbSchema, getVideoObjectSchema, getWebPageSchema } from '@/utils/structuredData';
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

  const videoBreadcrumbs = useMemo(() => [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: t('videos.page_title'), url: getFullUrl('/videos') },
  ], [t]);

  const structuredData = useMemo(() => {
    const eligibleVideos = videos.filter((v) => v.youtubeUrl && v.date).slice(0, 10);
    const videoSchemas = eligibleVideos
      .map((v) =>
        getVideoObjectSchema({ name: v.title, description: v.description || '', youtubeUrl: v.youtubeUrl, uploadDate: v.date, id: String(v.id), duration: v.duration, pageUrl: getFullUrl(`/videos/${v.id}`) }, t)
      )
      .filter((schema): schema is NonNullable<typeof schema> => schema !== null);
    const collectionSchema = getCollectionPageSchema({
      name: t('videos.page_title'),
      description: t('videos.page_desc'),
      url: getFullUrl('/videos'),
      hasPart: eligibleVideos.map((v) => ({ "@id": `https://peaceandmusic.net/videos/${v.id}#video` })),
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
        paragraphs={[
          t('videos.intro.p1'),
          t('videos.intro.p2'),
          t('videos.intro.p3'),
        ]}
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
        {!videosResource.error && !videosResource.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="h-full">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
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

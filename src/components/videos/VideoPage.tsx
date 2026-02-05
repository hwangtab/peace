import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { getVideos } from '../../api/videos';
import { VideoItem } from '../../types/video';
import { filterByEvent, isValidFilter } from '../../utils/filtering';
import { sortByDateDesc } from '../../utils/sorting';
import EventFilter from '../common/EventFilter';
import PageLayout from '../layout/PageLayout';
import PageHero from '../common/PageHero';
import VideoCard from './VideoCard';
import { getCollectionPageSchema } from '../../utils/structuredData';

export default function VideoPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    const loadVideos = async () => {
      const data = await getVideos(i18n.language);
      setVideos(data);
    };
    loadVideos();
  }, [i18n.language]);

  // Sync filter with query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam && isValidFilter(filterParam)) {
      setSelectedFilter(filterParam);
    }
  }, [location.search]);

  const filteredVideos = useMemo(
    () => sortByDateDesc(filterByEvent(videos, selectedFilter)),
    [videos, selectedFilter]
  );

  // Collection Page Schema
  const collectionSchema = getCollectionPageSchema({
    name: t('videos.page_title'),
    description: t('videos.page_desc'),
    url: "https://peaceandmusic.net/videos"
  }, i18n.language);

  return (
    <PageLayout
      title={t('videos.page_title')}
      description={t('videos.page_desc')}
      keywords={t('videos.keywords')}
      background="sunlight-glow"
      structuredData={collectionSchema}
      disableTopPadding={true}
    >
      <PageHero
        title={t('videos.hero_title')}
        subtitle={t('videos.hero_subtitle')}
        backgroundImage="/images-webp/camps/2023/IMG_2064.webp"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <EventFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          colorScheme="ocean"
          filterOrder="videos"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredVideos.map((video) => (
            <div key={video.id} className="h-full">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

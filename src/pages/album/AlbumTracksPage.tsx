import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import TracksSection from '@/components/home/TracksSection';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import { getMusicPlaylistSchema, getBreadcrumbSchema } from '@/utils/structuredData';
import { Musician } from '@/types/musician';
import { Track } from '@/types/track';
import { getFullUrl } from '@/config/env';

interface AlbumTracksPageProps {
  initialTracks?: Track[];
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const AlbumTracksPage = ({
  initialTracks = [],
  initialMusicians = [],
  initialLocale = 'ko',
}: AlbumTracksPageProps) => {
  const { t, i18n } = useTranslation();

  // Playlist Schema - built from actual tracks data
  const playlistSchema = useMemo(
    () =>
      getMusicPlaylistSchema(
        initialTracks.map((track) => ({
          name: track.title,
          url: getFullUrl(`/album/tracks/${track.id}`),
        })),
        i18n.language,
        t
      ),
    [initialTracks, i18n.language, t]
  );

  const breadcrumbs = [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: t('nav.album'), url: getFullUrl('/album/about') },
    { name: t('nav.track'), url: getFullUrl('/album/tracks') },
  ];

  return (
    <PageLayout
      title={t('album.tracks_page_title')}
      description={t('album.tracks_page_desc')}
      keywords={t('album.tracks_page_keywords')}
      ogImage="/images-webp/gallery/152.webp"
      background="sky-horizon"
      structuredData={[playlistSchema, getBreadcrumbSchema(breadcrumbs)]}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <PageHero
        title={t('nav.track')}
        subtitle={t('album.tracks_hero_subtitle')}
        backgroundImage="/images-webp/gallery/152.webp"
      />
      <div className="pt-16 md:pt-20 pb-12 md:pb-16">
        <TracksSection
          enableSectionWrapper={false}
          hideSectionHeader={true}
          initialTracks={initialTracks}
          initialMusicians={initialMusicians}
          initialLocale={initialLocale}
        />
      </div>
    </PageLayout>
  );
};

export default AlbumTracksPage;

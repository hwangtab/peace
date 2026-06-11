import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import TracksSection from '@/components/home/TracksSection';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import PageHero from '@/components/common/PageHero';
import {
  getMusicPlaylistSchema,
  getBreadcrumbSchema,
  getWebPageSchema,
} from '@/utils/structuredData';
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
  const { t, i18n } = useTranslation(['album', 'translation']);

  // Playlist Schema - built from actual tracks data
  const playlistSchema = useMemo(
    () =>
      getMusicPlaylistSchema(
        initialTracks.map((track) => ({
          name: track.title,
          url: getFullUrl(`/album/tracks/${track.id}`),
          duration: track.duration,
        })),
        i18n.language,
        t
      ),
    [initialTracks, i18n.language, t]
  );

  const breadcrumbs = useMemo(
    () => [
      { name: t('translation:nav.home'), url: getFullUrl('/') },
      { name: t('translation:nav.album'), url: getFullUrl('/album/about') },
      { name: t('translation:nav.track'), url: getFullUrl('/album/tracks') },
    ],
    [t]
  );

  const structuredData = useMemo(
    () => [
      playlistSchema,
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('tracks_page_title'),
        description: t('tracks_page_desc'),
        url: getFullUrl('/album/tracks'),
        datePublished: '2024-10-12',
        keywords: [
          '강정피스앤뮤직캠프 수록곡',
          'Gangjeong Peace Music Camp tracks',
          '평화 음악 수록곡',
          'peace music tracks',
          '앨범 트랙리스트',
          'album tracklist',
          '한국 인디 음악',
          'Korean indie music',
        ],
      }),
    ],
    [playlistSchema, breadcrumbs, t]
  );

  return (
    <PageLayout
      title={t('tracks_page_title')}
      description={t('tracks_page_desc')}
      ogImage="/images-webp/gallery/152.webp"
      ogImageAlt={t('tracks_page_title')}
      ogType="music.playlist"
      background="sky-horizon"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <PageHero
        title={t('translation:nav.track')}
        subtitle={t('tracks_hero_subtitle')}
        backgroundImage="/images-webp/gallery/152.webp"
      />
      <Section background="white" paddingTop="normal" paddingBottom="tight">
        <TracksSection
          enableSectionWrapper={false}
          hideSectionHeader={true}
          initialTracks={initialTracks}
          initialMusicians={initialMusicians}
          initialLocale={initialLocale}
        />
      </Section>
    </PageLayout>
  );
};

export default AlbumTracksPage;

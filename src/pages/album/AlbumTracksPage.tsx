import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import TracksSection from '../../components/home/TracksSection';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/common/PageHero';
import { getMusicPlaylistSchema, getBreadcrumbSchema } from '../../utils/structuredData';
import { Musician } from '../../types/musician';
import { Track } from '../../types/track';

interface AlbumTracksPageProps {
  initialTracks?: Track[];
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const AlbumTracksPage = ({ initialTracks = [], initialMusicians = [], initialLocale = 'ko' }: AlbumTracksPageProps) => {
  const { t, i18n } = useTranslation();

  // Playlist Schema
  const playlistSchema = useMemo(() => getMusicPlaylistSchema(
    initialMusicians
      .filter(m => m.trackTitle && m.id !== 13) // Exclude non-tracks if any
      .map(m => ({
        name: m.trackTitle!,
        url: "https://peaceandmusic.net/album/tracks"
      })),
    i18n.language
  ), [initialMusicians, i18n.language]);

  return (
    <PageLayout
      title={t('album.tracks_page_title')}
      description={t('album.tracks_page_desc')}
      keywords={t('album.tracks_page_keywords')}
      ogImage="/images-webp/gallery/152.webp"
      background="sky-horizon"
      structuredData={[
        playlistSchema,
        getBreadcrumbSchema([
          { name: t('nav.home'), url: "https://peaceandmusic.net/" },
          { name: t('nav.album'), url: "https://peaceandmusic.net/album/about" },
          { name: t('nav.track'), url: "https://peaceandmusic.net/album/tracks" }
        ])
      ]}
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

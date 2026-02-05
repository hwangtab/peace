import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import TracksSection from '../../components/home/TracksSection';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/common/PageHero';
import { getMusicPlaylistSchema } from '../../utils/structuredData';
import { getMusicians } from '../../api/musicians';
import { Musician } from '../../types/musician';

const AlbumTracksPage = () => {
  const { t, i18n } = useTranslation();
  const [musicians, setMusicians] = useState<Musician[]>([]);

  useEffect(() => {
    const loadMusicians = async () => {
      const data = await getMusicians(i18n.language);
      setMusicians(data);
    };
    loadMusicians();
  }, [i18n.language]);

  // Playlist Schema
  const playlistSchema = useMemo(() => getMusicPlaylistSchema(
    musicians
      .filter(m => m.trackTitle && m.id !== 13) // Exclude non-tracks if any
      .map(m => ({
        name: m.trackTitle!,
        url: "https://peaceandmusic.net/album/tracks"
      })),
    i18n.language
  ), [musicians, i18n.language]);

  return (
    <PageLayout
      title={t('album.tracks_page_title')}
      description={t('album.tracks_page_desc')}
      keywords={t('album.tracks_page_keywords')}
      background="sky-horizon"
      structuredData={playlistSchema}
      disableTopPadding={true}
    >
      <PageHero
        title={t('nav.track')}
        subtitle={t('album.tracks_hero_subtitle')}
        backgroundImage="/images-webp/gallery/152.webp"
      />
      <div className="pt-12">
        <TracksSection enableSectionWrapper={false} hideSectionHeader={true} />
      </div>
    </PageLayout>
  );
};

export default AlbumTracksPage;

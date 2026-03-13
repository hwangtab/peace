import React from 'react';
import { useTranslation } from 'next-i18next';
import MusiciansSection from '../../components/home/MusiciansSection';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/common/PageHero';
import { getCollectionPageSchema } from '../../utils/structuredData';
import { Musician } from '../../types/musician';

interface AlbumMusiciansPageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const AlbumMusiciansPage = ({ initialMusicians = [], initialLocale = 'ko' }: AlbumMusiciansPageProps) => {
  const { t } = useTranslation();
  const collectionSchema = getCollectionPageSchema({
    name: t('album.musicians_page_title'),
    description: t('album.musicians_page_desc'),
    url: "https://peaceandmusic.net/album/musicians"
  });

  return (
    <PageLayout
      title={t('album.musicians_page_title')}
      description={t('album.musicians_page_desc')}
      keywords={t('album.musicians_page_keywords')}
      ogImage="/images-webp/gallery/2.webp"
      background="sunlight-glow"
      structuredData={collectionSchema}
      disableTopPadding={true}
    >
      <PageHero
        title={t('nav.musician')}
        subtitle={t('album.musicians_hero_subtitle')}
        backgroundImage="/images-webp/gallery/2.webp"
      />
      <div className="pt-12">
        <MusiciansSection
          enableSectionWrapper={false}
          hideSectionHeader={true}
          initialMusicians={initialMusicians}
          initialLocale={initialLocale}
        />
      </div>
    </PageLayout>
  );
};

export default AlbumMusiciansPage;

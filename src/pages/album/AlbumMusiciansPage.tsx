import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import MusiciansSection from '@/components/home/MusiciansSection';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import PageIntroSection from '@/components/common/PageIntroSection';
import { getCollectionPageSchema, getBreadcrumbSchema, getWebPageSchema } from '@/utils/structuredData';
import { Musician } from '@/types/musician';
import { getFullUrl } from '@/config/env';

interface AlbumMusiciansPageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const AlbumMusiciansPage = ({
  initialMusicians = [],
  initialLocale = 'ko',
}: AlbumMusiciansPageProps) => {
  const { t } = useTranslation();

  const breadcrumbs = useMemo(() => [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: t('nav.album'), url: getFullUrl('/album/about') },
    { name: t('nav.musician'), url: getFullUrl('/album/musicians') },
  ], [t]);

  const structuredData = useMemo(() => {
    const collectionSchema = getCollectionPageSchema({
      name: t('album.musicians_page_title'),
      description: t('album.musicians_page_desc'),
      url: getFullUrl('/album/musicians'),
      hasPart: initialMusicians.map((m) => ({ "@id": getFullUrl(`/album/musicians/${m.id}`) })),
    });
    return [
      collectionSchema,
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('album.musicians_page_title'),
        description: t('album.musicians_page_desc'),
        url: getFullUrl('/album/musicians'),
        datePublished: '2024-10-12',
        keywords: [
          '강정피스앤뮤직캠프 뮤지션',
          'Gangjeong Peace Music Camp musicians',
          '한국 인디 뮤지션',
          'Korean indie musicians',
          '평화음악가',
          'peace musicians',
          'GPMC artists',
          '강정 아티스트',
        ],
      }),
    ];
  }, [t, initialMusicians, breadcrumbs]);

  return (
    <PageLayout
      title={t('album.musicians_page_title')}
      description={t('album.musicians_page_desc')}
      ogImage="/images-webp/gallery/2.webp"
      ogImageAlt={t('album.musicians_page_title')}
      ogType="music.playlist"
      background="sunlight-glow"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
    >
      <PageHero
        title={t('nav.musician')}
        subtitle={t('album.musicians_hero_subtitle')}
        backgroundImage="/images-webp/gallery/2.webp"
      />
      <PageIntroSection
        eyebrow={t('album.musicians_intro.eyebrow')}
        heading={t('album.musicians_intro.heading')}
        paragraphs={[
          t('album.musicians_intro.p1'),
          t('album.musicians_intro.p2'),
          t('album.musicians_intro.p3'),
        ]}
        background="white"
      />
      <div className="pt-16 md:pt-20">
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

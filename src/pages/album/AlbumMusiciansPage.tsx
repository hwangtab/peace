import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import MusiciansSection from '@/components/home/MusiciansSection';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import PageHero from '@/components/common/PageHero';
import PageIntroSection from '@/components/common/PageIntroSection';
import {
  getCollectionPageSchema,
  getBreadcrumbSchema,
  getWebPageSchema,
} from '@/utils/structuredData';
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
  // album 을 default 로 두고, nav/common/app 같은 공유 키는 namespace 를 명시한다.
  const { t } = useTranslation(['album', 'translation']);

  const breadcrumbs = useMemo(
    () => [
      { name: t('translation:nav.home'), url: getFullUrl('/') },
      { name: t('translation:nav.album'), url: getFullUrl('/album/about') },
      { name: t('translation:nav.musician'), url: getFullUrl('/album/musicians') },
    ],
    [t]
  );

  const structuredData = useMemo(() => {
    const collectionSchema = getCollectionPageSchema({
      name: t('musicians_page_title'),
      description: t('musicians_page_desc'),
      url: getFullUrl('/album/musicians'),
      hasPart: initialMusicians.map((m) => ({ '@id': getFullUrl(`/album/musicians/${m.id}`) })),
    });
    return [
      collectionSchema,
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('musicians_page_title'),
        description: t('musicians_page_desc'),
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
      title={t('musicians_page_title')}
      description={t('musicians_page_desc')}
      ogImage="/images/og/album-musicians.jpg"
      ogImageAlt={t('musicians_page_title')}
      ogType="music.playlist"
      background="sunlight-glow"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
    >
      <PageHero
        title={t('translation:nav.musician')}
        subtitle={t('musicians_hero_subtitle')}
        backgroundImage="/images-webp/gallery/2.webp"
      />
      <PageIntroSection
        eyebrow={t('musicians_intro.eyebrow')}
        heading={t('musicians_intro.heading')}
        paragraphs={[t('musicians_intro.p1'), t('musicians_intro.p2'), t('musicians_intro.p3')]}
        background="white"
      />
      <Section background="white" paddingTop="none" paddingBottom="tight">
        <MusiciansSection
          enableSectionWrapper={false}
          hideSectionHeader={true}
          initialMusicians={initialMusicians}
          initialLocale={initialLocale}
        />
      </Section>
    </PageLayout>
  );
};

export default AlbumMusiciansPage;

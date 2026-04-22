import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { VideoItem } from '@/types/video';
import { getProfilePageSchema, getBreadcrumbSchema, getWebPageSchema } from '@/utils/structuredData';
import { useCamps } from '@/hooks/useCamps';
import { getFullUrl } from '@/config/env';
import PageLayout from '../layout/PageLayout';
import { BreadcrumbItem } from '../shared/BreadcrumbNav';
import SectionWave from '../layout/SectionWave';
import MusicianHeroSection from './MusicianHeroSection';
import MusicianDescriptionSection from './MusicianDescriptionSection';
import RelatedVideosSection from './RelatedVideosSection';
import OtherMusiciansSection from './OtherMusiciansSection';
import CampFinalCTA from './CampFinalCTA';

export interface MusicianDetailContentProps {
  musician: Musician;
  relatedVideos: VideoItem[];
  otherMusicians: Musician[];
  backHref: string;
  backLabel: string;
  breadcrumbs: BreadcrumbItem[];
  musicianHrefPrefix: string;
  fundingUrl?: string;
  otherMusiciansTitle?: string;
  pageContext?: 'album' | 'camp';
}

export default function MusicianDetailContent({
  musician,
  relatedVideos,
  otherMusicians,
  backHref,
  backLabel,
  breadcrumbs,
  musicianHrefPrefix,
  fundingUrl,
  otherMusiciansTitle,
  pageContext,
}: MusicianDetailContentProps) {
  const { t, i18n } = useTranslation();
  const isCampPage = pageContext === 'camp';
  const allCamps = useCamps();
  const campList = isCampPage ? allCamps : [];
  const latestCamp = campList.length > 0 ? campList[campList.length - 1] : undefined;
  const latestCampYear = latestCamp?.year;

  const pageTitle =
    isCampPage && latestCampYear
      ? `${musician.name} — ${t(`camp.title_${latestCampYear}`)} | ${t('nav.logo')}`
      : `${musician.name} | ${t('app.title')}`;

  const pageDescription = isCampPage
    ? `${musician.shortDescription} ${t('camp.seo_musician_suffix')}`
    : musician.shortDescription;

  const musicianSameAs = [
    ...musician.instagramUrls,
    ...(musician.youtubeUrl ? [musician.youtubeUrl] : []),
  ];

  const profileSchema = getProfilePageSchema(
    {
      name: musician.name,
      description: musician.shortDescription,
      image: musician.imageUrl ? getFullUrl(musician.imageUrl) : undefined,
      jobTitle: 'Musician',
      url: getFullUrl(`${musicianHrefPrefix}/${musician.id}`),
      sameAs: musicianSameAs.length > 0 ? musicianSameAs : undefined,
      genre: musician.genre.length > 0 ? musician.genre : undefined,
    },
    i18n.language,
    t
  );

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);
  const webPageSchema = getWebPageSchema({
    name: pageTitle,
    description: pageDescription,
    url: getFullUrl(`${musicianHrefPrefix}/${musician.id}`),
  });

  return (
    <PageLayout
      title={pageTitle}
      description={pageDescription}
      ogImage={musician.imageUrl || '/images-webp/album/albumart.webp'}
      ogImageAlt={musician.name}
      ogType="profile"
      structuredData={[profileSchema, breadcrumbSchema, webPageSchema]}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
      disableBottomPadding={true}
      className="flex flex-col"
    >
      <MusicianHeroSection musician={musician} fundingUrl={fundingUrl} isCampPage={isCampPage} />

      <MusicianDescriptionSection
        musician={musician}
        backHref={backHref}
        backLabel={backLabel}
        fundingUrl={fundingUrl}
        isCampPage={isCampPage}
        latestCamp={latestCamp}
      />

      {relatedVideos.length > 0 && (
        <SectionWave color="ocean-sand" flow="up" />
      )}

      {relatedVideos.length > 0 && <RelatedVideosSection relatedVideos={relatedVideos} />}

      {otherMusicians.length > 0 && relatedVideos.length > 0 && (
        <SectionWave color="white" flow="up" />
      )}

      {otherMusicians.length > 0 && (
        <OtherMusiciansSection
          otherMusicians={otherMusicians}
          musicianHrefPrefix={musicianHrefPrefix}
          backHref={backHref}
          backLabel={backLabel}
          isCampPage={isCampPage}
          otherMusiciansTitle={otherMusiciansTitle}
        />
      )}

      {isCampPage && fundingUrl && (
        <CampFinalCTA
          musicianId={musician.id}
          fundingUrl={fundingUrl}
          hasOtherMusicians={otherMusicians.length > 0}
          hasRelatedVideos={relatedVideos.length > 0}
          backHref={backHref}
          backLabel={backLabel}
        />
      )}
    </PageLayout>
  );
}

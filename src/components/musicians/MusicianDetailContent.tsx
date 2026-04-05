import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { VideoItem } from '@/types/video';
import { getProfilePageSchema, getBreadcrumbSchema } from '@/utils/structuredData';
import { getCamps } from '@/data/camps';
import { getFullUrl } from '@/config/env';
import PageLayout from '../layout/PageLayout';
import { BreadcrumbItem } from '../shared/BreadcrumbNav';
import WaveDivider from '../common/WaveDivider';
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
  const campList = isCampPage ? getCamps(i18n.language, t) : [];
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
    },
    i18n.language,
    t
  );

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  return (
    <PageLayout
      title={pageTitle}
      description={pageDescription}
      ogImage={musician.imageUrl || '/images-webp/album/albumart.webp'}
      structuredData={[profileSchema, breadcrumbSchema]}
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
        <WaveDivider className="text-ocean-sand -mt-[60px] sm:-mt-[100px] relative z-10" />
      )}

      {relatedVideos.length > 0 && <RelatedVideosSection relatedVideos={relatedVideos} />}

      {otherMusicians.length > 0 && relatedVideos.length > 0 && (
        <WaveDivider className="text-white -mt-[60px] sm:-mt-[100px] relative z-10" />
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

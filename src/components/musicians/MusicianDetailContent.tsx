import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { VideoItem } from '@/types/video';
import { getProfilePageSchema, getBreadcrumbSchema } from '@/utils/structuredData';
import { getCamps } from '@/data/camps';
import PageLayout from '../layout/PageLayout';
import WaveDivider from '../common/WaveDivider';
import MusicianHeroSection from './MusicianHeroSection';
import MusicianDescriptionSection from './MusicianDescriptionSection';
import RelatedVideosSection from './RelatedVideosSection';
import OtherMusiciansSection from './OtherMusiciansSection';
import CampFinalCTA from './CampFinalCTA';

interface BreadcrumbItem {
  name: string;
  url: string;
}

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
  const camp2026 = isCampPage ? getCamps(i18n.language).find((c) => c.id === 'camp-2026') : undefined;

  const pageTitle = isCampPage
    ? `${musician.name} — ${t('camp.title_2026')} | ${t('nav.logo')}`
    : `${musician.name} | ${t('app.title')}`;

  const pageDescription = isCampPage
    ? `${musician.shortDescription} ${t('camp.seo_musician_suffix')}`
    : musician.shortDescription;

  const baseKeywords = `${musician.name}, ${musician.genre.join(', ')}, ${t('app.title')}`;
  const pageKeywords = isCampPage
    ? `${baseKeywords}, ${t('camp.title_2026')}, 2026, ${t('camp.keywords_base')}`
    : baseKeywords;

  const profileSchema = getProfilePageSchema(
    {
      name: musician.name,
      description: musician.shortDescription,
      image: musician.imageUrl ? `https://peaceandmusic.net${musician.imageUrl}` : undefined,
      jobTitle: 'Musician',
    },
    i18n.language
  );

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  return (
    <PageLayout
      title={pageTitle}
      description={pageDescription}
      keywords={pageKeywords}
      ogImage={musician.imageUrl || undefined}
      structuredData={[profileSchema, breadcrumbSchema]}
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
        camp2026={camp2026}
      />

      {relatedVideos.length > 0 && (
        <WaveDivider className="text-ocean-sand -mt-[60px] sm:-mt-[100px] relative z-10" />
      )}

      {relatedVideos.length > 0 && (
        <RelatedVideosSection relatedVideos={relatedVideos} />
      )}

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

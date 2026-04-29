import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../../next-i18next.config';
import { Musician } from '@/types/musician';
import { VideoItem } from '@/types/video';
import { loadLocalizedData } from '@/utils/dataLoader';
import { camps } from '@/data/camps';
import { useCamp } from '@/hooks/useCamps';
import MusicianDetailContent from '@/components/musicians/MusicianDetailContent';
import { loadRelatedVideos, selectOtherMusicians } from '@/utils/musicianPageUtils';
import { getFullUrl } from '@/config/env';

interface CampMusicianPageProps {
  musician: Musician;
  relatedVideos: VideoItem[];
  otherMusicians: Musician[];
  nativeName: string | null;
}

export default function CampMusicianPage({
  musician,
  relatedVideos,
  otherMusicians,
  nativeName,
}: CampMusicianPageProps) {
  const { t } = useTranslation();
  const camp2026 = useCamp('camp-2026');

  return (
    <MusicianDetailContent
      musician={musician}
      relatedVideos={relatedVideos}
      otherMusicians={otherMusicians}
      backHref="/camps/2026"
      backLabel={t('nav.camp')}
      breadcrumbs={[
        { name: t('nav.home'), url: getFullUrl('/') },
        { name: t('nav.camp'), url: getFullUrl('/camps/2026') },
        {
          name: musician.name,
          url: getFullUrl(`/camps/2026/musicians/${musician.id}`),
        },
      ]}
      musicianHrefPrefix="/camps/2026/musicians"
      otherMusiciansTitle={t('camp.other_musicians')}
      fundingUrl={camp2026?.fundingUrl}
      pageContext="camp"
      nativeName={nativeName ?? undefined}
    />
  );
}

// Get all camp-2026 musician IDs
function getCamp2026MusicianIds(): number[] {
  const camp2026 = camps.find((c) => c.id === 'camp-2026');
  if (!camp2026?.participants) return [];
  return camp2026.participants
    .filter(
      (p): p is { name: string; musicianId: number } =>
        typeof p === 'object' && 'musicianId' in p && typeof p.musicianId === 'number'
    )
    .map((p) => p.musicianId);
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const musicianIds = getCamp2026MusicianIds();
  const paths = (locales || ['ko']).flatMap((locale) =>
    musicianIds.map((id) => ({
      params: { id: String(id) },
      locale,
    }))
  );

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params, locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';
  const musicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json');
  const musician = musicians.find((m) => String(m.id) === params?.id);

  const campMusicianIds = getCamp2026MusicianIds();
  if (!musician || !campMusicianIds.includes(musician.id)) {
    return { notFound: true };
  }

  const koMusicians =
    resolvedLocale === 'ko' ? musicians : loadLocalizedData<Musician>('ko', 'musicians.json');
  const nativeName = koMusicians.find((m) => m.id === musician.id)?.name;

  const relatedVideos = loadRelatedVideos(musician.id, resolvedLocale);

  const campMusicianIdSet = new Set(campMusicianIds);
  const candidates = musicians.filter(
    (m) => m.id !== musician.id && m.imageUrl && campMusicianIdSet.has(m.id)
  );
  const otherMusicians = selectOtherMusicians(musician.id, candidates);

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      musician,
      relatedVideos,
      otherMusicians,
      nativeName: nativeName ?? null,
    },
    revalidate: 3600,
  };
}

import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../../next-i18next.config';
import { Musician } from '../../../../src/types/musician';
import { VideoItem } from '../../../../src/types/video';
import { loadLocalizedData } from '../../../../src/utils/dataLoader';
import { camps, getCamps } from '../../../../src/data/camps';
import MusicianDetailContent from '../../../../src/components/musicians/MusicianDetailContent';

interface CampMusicianPageProps {
  musician: Musician;
  relatedVideos: VideoItem[];
  otherMusicians: Musician[];
}

export default function CampMusicianPage({
  musician,
  relatedVideos,
  otherMusicians,
}: CampMusicianPageProps) {
  const { t, i18n } = useTranslation();
  const camp2026 = getCamps(i18n.language).find((c) => c.id === 'camp-2026');

  return (
    <MusicianDetailContent
      musician={musician}
      relatedVideos={relatedVideos}
      otherMusicians={otherMusicians}
      backHref="/camps/2026"
      backLabel={t('nav.camp')}
      breadcrumbs={[
        { name: t('nav.home'), url: 'https://peaceandmusic.net/' },
        { name: t('nav.camp'), url: 'https://peaceandmusic.net/camps/2026' },
        {
          name: musician.name,
          url: `https://peaceandmusic.net/camps/2026/musicians/${musician.id}`,
        },
      ]}
      musicianHrefPrefix="/camps/2026/musicians"
      otherMusiciansTitle="함께하는 뮤지션"
      fundingUrl={camp2026?.fundingUrl}
      pageContext="camp"
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

  // Find related videos
  const videos = loadLocalizedData<VideoItem>(resolvedLocale, 'videos.json');
  const directVideos = videos.filter((v) => v.musicianIds?.includes(musician.id));
  const relatedVideos = [...directVideos];

  // Other camp musicians only (same camp, with image)
  const campMusicianIdSet = new Set(campMusicianIds);
  const candidates = musicians.filter(
    (m) => m.id !== musician.id && m.imageUrl && campMusicianIdSet.has(m.id)
  );

  const seed = musician.id;
  const hash = (id: number) => {
    let h = (id * 2654435761 + seed * 40503) | 0;
    h = (((h >>> 16) ^ h) * 45679) | 0;
    return ((h >>> 16) ^ h) | 0;
  };
  const otherMusicians = [...candidates].sort((a, b) => hash(a.id) - hash(b.id)).slice(0, 8);

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      musician,
      relatedVideos,
      otherMusicians,
    },
  };
}

import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../next-i18next.config';
import { Musician } from '@/types/musician';
import { VideoItem } from '@/types/video';
import { Track } from '@/types/track';
import { loadLocalizedData } from '@/utils/dataLoader';
import { camps } from '@/data/camps';
import MusicianDetailContent from '@/components/musicians/MusicianDetailContent';
import { buildTrackMusicianRelation } from '@/utils/trackMusician';
import { loadRelatedVideos, selectOtherMusicians } from '@/utils/musicianPageUtils';
import { getFullUrl } from '@/config/env';

interface MusicianPageProps {
  musician: Musician;
  relatedVideos: VideoItem[];
  otherMusicians: Musician[];
  nativeName: string | null;
}

export default function AlbumMusicianPage({
  musician,
  relatedVideos,
  otherMusicians,
  nativeName,
}: MusicianPageProps) {
  const { t } = useTranslation();

  // Check if this musician is in camp-2026 to show funding CTA
  const camp2026 = camps.find((c) => c.id === 'camp-2026');
  const isCamp2026Participant = camp2026?.participants?.some(
    (p) => typeof p === 'object' && 'musicianId' in p && p.musicianId === musician.id
  );

  return (
    <MusicianDetailContent
      musician={musician}
      relatedVideos={relatedVideos}
      otherMusicians={otherMusicians}
      backHref="/album/musicians"
      backLabel={t('nav.musician')}
      breadcrumbs={[
        { name: t('nav.home'), url: getFullUrl('/') },
        { name: t('nav.album'), url: getFullUrl('/album/about') },
        { name: t('nav.musician'), url: getFullUrl('/album/musicians') },
        { name: musician.name, url: getFullUrl(`/album/musicians/${musician.id}`) },
      ]}
      musicianHrefPrefix="/album/musicians"
      fundingUrl={isCamp2026Participant ? camp2026?.fundingUrl : undefined}
      nativeName={nativeName ?? undefined}
    />
  );
}

const getCanonicalAlbumMusicianIds = (): Set<number> => {
  const musicians = loadLocalizedData<Musician>('ko', 'musicians.json');
  const tracks = loadLocalizedData<Track>('ko', 'tracks.json');
  const relation = buildTrackMusicianRelation(tracks, musicians);
  return new Set(relation.trackByMusicianId.keys());
};

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const albumMusicianIds = getCanonicalAlbumMusicianIds();
  const musicians = loadLocalizedData<Musician>('ko', 'musicians.json');
  const albumMusicians = musicians.filter((m) => albumMusicianIds.has(m.id));
  const paths = (locales || ['ko']).flatMap((locale) =>
    albumMusicians.map((m) => ({
      params: { id: String(m.id) },
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
  const albumMusicianIds = getCanonicalAlbumMusicianIds();
  const musicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json');
  const musician = musicians.find((m) => String(m.id) === params?.id);

  if (!musician || !albumMusicianIds.has(musician.id)) {
    return { notFound: true };
  }

  const relatedVideos = loadRelatedVideos(musician.id, resolvedLocale, {
    includeEventVideos: true,
    events: musician.events,
  });

  const candidates = musicians.filter(
    (m) => m.id !== musician.id && m.imageUrl && albumMusicianIds.has(m.id)
  );
  const otherMusicians = selectOtherMusicians(musician.id, candidates);

  const koMusicians =
    resolvedLocale === 'ko' ? musicians : loadLocalizedData<Musician>('ko', 'musicians.json');
  const nativeName = koMusicians.find((m) => m.id === musician.id)?.name ?? null;

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      musician,
      relatedVideos,
      otherMusicians,
      nativeName,
    },
    revalidate: 3600,
  };
}

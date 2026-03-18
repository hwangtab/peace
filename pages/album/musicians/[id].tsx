import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../next-i18next.config';
import { Musician } from '../../../src/types/musician';
import { VideoItem } from '../../../src/types/video';
import { loadLocalizedData } from '../../../src/utils/dataLoader';
import { camps } from '../../../src/data/camps';
import MusicianDetailContent from '../../../src/components/musicians/MusicianDetailContent';

interface MusicianPageProps {
  musician: Musician;
  relatedVideos: VideoItem[];
  otherMusicians: Musician[];
}

export default function AlbumMusicianPage({ musician, relatedVideos, otherMusicians }: MusicianPageProps) {
  const { t } = useTranslation();

  // Check if this musician is in camp-2026 to show funding CTA
  const camp2026 = camps.find(c => c.id === 'camp-2026');
  const isCamp2026Participant = camp2026?.participants?.some(
    p => typeof p === 'object' && 'musicianId' in p && p.musicianId === musician.id
  );

  return (
    <MusicianDetailContent
      musician={musician}
      relatedVideos={relatedVideos}
      otherMusicians={otherMusicians}
      backHref="/album/musicians"
      backLabel={t('nav.musician')}
      breadcrumbs={[
        { name: t('nav.home'), url: 'https://peaceandmusic.net/' },
        { name: t('nav.album'), url: 'https://peaceandmusic.net/album/about' },
        { name: t('nav.musician'), url: 'https://peaceandmusic.net/album/musicians' },
        { name: musician.name, url: `https://peaceandmusic.net/album/musicians/${musician.id}` },
      ]}
      musicianHrefPrefix="/album/musicians"
      fundingUrl={isCamp2026Participant ? camp2026?.fundingUrl : undefined}
    />
  );
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const musicians = loadLocalizedData<Musician>('ko', 'musicians.json');
  // Only generate pages for album musicians (those with trackTitle)
  const albumMusicians = musicians.filter((m) => m.trackTitle);
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
  const musicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json');
  const musician = musicians.find((m) => String(m.id) === params?.id);

  if (!musician || !musician.trackTitle) {
    return { notFound: true };
  }

  // Find related videos
  const videos = loadLocalizedData<VideoItem>(resolvedLocale, 'videos.json');
  const directVideos = videos.filter((v) =>
    v.musicianIds?.includes(musician.id)
  );
  const eventVideos = musician.events
    ? videos.filter((v) =>
        v.eventType && v.eventYear &&
        musician.events!.includes(`${v.eventType}-${v.eventYear}`) &&
        !directVideos.some((dv) => dv.id === v.id)
      )
    : [];
  const relatedVideos = [...directVideos, ...eventVideos];

  // Other album musicians only (with trackTitle, with image)
  const candidates = musicians.filter((m) =>
    m.id !== musician.id && m.trackTitle && m.imageUrl
  );

  const seed = musician.id;
  const hash = (id: number) => {
    let h = (id * 2654435761 + seed * 40503) | 0;
    h = (((h >>> 16) ^ h) * 45679) | 0;
    return ((h >>> 16) ^ h) | 0;
  };
  const otherMusicians = [...candidates]
    .sort((a, b) => hash(a.id) - hash(b.id))
    .slice(0, 8);

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      musician,
      relatedVideos,
      otherMusicians,
    },
  };
}

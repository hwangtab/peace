import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import nextI18NextConfig from '../../../next-i18next.config';
import { Musician } from '../../../src/types/musician';
import { VideoItem } from '../../../src/types/video';
import { loadLocalizedData } from '../../../src/utils/dataLoader';
import { camps } from '../../../src/data/camps';
import { getProfilePageSchema, getBreadcrumbSchema } from '../../../src/utils/structuredData';
import { extractInstagramUsername } from '../../../src/utils/instagram';
import PageLayout from '../../../src/components/layout/PageLayout';
import MusicianCard from '../../../src/components/musicians/MusicianCard';
import VideoCard from '../../../src/components/videos/VideoCard';
import InstagramIcon from '../../../src/components/icons/InstagramIcon';
import YouTubeIcon from '../../../src/components/icons/YouTubeIcon';

interface MusicianPageProps {
  musician: Musician;
  relatedVideos: VideoItem[];
  otherMusicians: Musician[];
  musicianCampYear: number | null;
}

export default function MusicianPage({ musician, relatedVideos, otherMusicians, musicianCampYear }: MusicianPageProps) {
  const { t, i18n } = useTranslation();

  const profileSchema = getProfilePageSchema({
    name: musician.name,
    description: musician.shortDescription,
    image: musician.imageUrl ? `https://peaceandmusic.net${musician.imageUrl}` : undefined,
    jobTitle: 'Musician',
  }, i18n.language);

  const breadcrumbSchema = getBreadcrumbSchema(
    musicianCampYear
      ? [
          { name: t('nav.home'), url: 'https://peaceandmusic.net/' },
          { name: t('nav.camp'), url: `https://peaceandmusic.net/camps/${musicianCampYear}` },
          { name: musician.name, url: `https://peaceandmusic.net/album/musicians/${musician.id}` },
        ]
      : [
          { name: t('nav.home'), url: 'https://peaceandmusic.net/' },
          { name: t('nav.album'), url: 'https://peaceandmusic.net/album/about' },
          { name: t('nav.musician'), url: 'https://peaceandmusic.net/album/musicians' },
          { name: musician.name, url: `https://peaceandmusic.net/album/musicians/${musician.id}` },
        ]
  );

  return (
    <PageLayout
      title={`${musician.name} | ${t('app.title')}`}
      description={musician.shortDescription}
      keywords={`${musician.name}, ${musician.genre.join(', ')}, ${t('app.title')}`}
      ogImage={musician.imageUrl || undefined}
      structuredData={[profileSchema, breadcrumbSchema]}
      disableTopPadding={true}
      disableBottomPadding={true}
      className="flex flex-col"
    >
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-jeju-ocean to-ocean-mist min-h-[420px] flex items-end">
        {/* Background image blur */}
        {musician.imageUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={musician.imageUrl}
              alt=""
              fill
              className="object-cover object-center opacity-20 blur-sm scale-105"
              priority
              aria-hidden
            />
          </div>
        )}
        <div className="relative z-10 w-full pt-32 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
              {/* Profile image */}
              {musician.imageUrl && (
                <div className="w-full md:w-[380px] flex-shrink-0">
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
                    <Image
                      src={musician.imageUrl}
                      alt={musician.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover object-center"
                      priority
                    />
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 text-white pb-2">
                {/* Genre tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {musician.genre.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium tracking-wide"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <h1 className="typo-h1 mb-5 leading-tight">{musician.name}</h1>

                {/* Track */}
                {musician.trackTitle && (
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-widest text-white/60 mb-1">
                      {t('common.track')}
                    </p>
                    <Link
                      href="/album/tracks"
                      className="text-golden-sun hover:text-yellow-300 transition-colors text-lg font-medium"
                    >
                      {musician.trackTitle}
                    </Link>
                  </div>
                )}

                {/* Social Links */}
                {(musician.instagramUrls.length > 0 || musician.youtubeUrl) && (
                  <div className="flex flex-wrap gap-2">
                    {musician.instagramUrls.map((url) => {
                      const username = extractInstagramUsername(url);
                      return (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
                        >
                          <InstagramIcon className="w-4 h-4 mr-1.5" />
                          @{username}
                        </a>
                      );
                    })}
                    {musician.youtubeUrl && (
                      <a
                        href={musician.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <YouTubeIcon className="w-4 h-4 mr-1.5" />
                        YouTube
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="typo-body text-gray-700 leading-relaxed whitespace-pre-wrap text-pretty">
              {musician.description}
            </p>

            {/* Navigation */}
            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href={musicianCampYear ? `/camps/${musicianCampYear}` : '/album/musicians'}
                className="inline-flex items-center px-4 py-2 bg-ocean-sand text-jeju-ocean rounded-lg hover:bg-ocean-mist transition-colors text-sm font-medium"
              >
                &larr; {musicianCampYear ? t('nav.camp') : t('nav.musician')}
              </Link>
              {musician.trackTitle && (
                <Link
                  href="/album/tracks"
                  className="inline-flex items-center px-4 py-2 bg-golden-sun text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors text-sm font-medium"
                >
                  {t('nav.track')} &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div className="bg-white border-t border-gray-100 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="typo-h2 text-jeju-ocean mb-8">
                {t('nav.video')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Musicians */}
      {otherMusicians.length > 0 && (
        <div className="bg-ocean-sand py-16">
          <div className="container mx-auto px-4">
            <h2 className="typo-h2 text-jeju-ocean text-center mb-10">
              {t('nav.musician')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {otherMusicians.map((m, i) => (
                <MusicianCard key={m.id} musician={m} index={i} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href={musicianCampYear ? `/camps/${musicianCampYear}` : '/album/musicians'}
                className="inline-flex items-center px-6 py-3 bg-jeju-ocean text-white rounded-lg hover:bg-ocean-mist transition-colors font-medium"
              >
                {musicianCampYear ? t('nav.camp') : t('nav.musician')} &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const musicians = loadLocalizedData<Musician>('ko', 'musicians.json');
  const paths = (locales || ['ko']).flatMap((locale) =>
    musicians.map((m) => ({
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

  if (!musician) {
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

  // Context-aware "other musicians" filtering
  const isAlbumMusician = Boolean(musician.trackTitle);

  // Determine camp year for camp-only musicians
  const musicianCampYear = isAlbumMusician ? null :
    camps
      .filter(c => c.participants?.some(p =>
        typeof p === 'object' && 'musicianId' in p && p.musicianId === musician.id
      ))
      .sort((a, b) => b.year - a.year)[0]?.year ?? null;

  // Exclude self and musicians without images
  const validMusicians = musicians.filter((m) => m.id !== musician.id && m.imageUrl);

  let candidates: Musician[];
  if (isAlbumMusician) {
    // Album context: only show other album musicians (with trackTitle)
    candidates = validMusicians.filter((m) => m.trackTitle);
  } else {
    // Camp context: only show musicians from the same camp(s)
    const musicianCamps = camps.filter(c =>
      c.participants?.some(p =>
        typeof p === 'object' && 'musicianId' in p && p.musicianId === musician.id
      )
    );
    const campMusicianIds = new Set<number>();
    musicianCamps.forEach(c =>
      c.participants?.forEach(p => {
        if (typeof p === 'object' && 'musicianId' in p && p.musicianId && p.musicianId !== musician.id) {
          campMusicianIds.add(p.musicianId);
        }
      })
    );
    candidates = validMusicians.filter((m) => campMusicianIds.has(m.id));
  }

  // Better hash for varied sorting per musician
  const seed = musician.id;
  const hash = (id: number) => {
    let h = (id * 2654435761 + seed * 40503) | 0;
    h = (((h >>> 16) ^ h) * 45679) | 0;
    return ((h >>> 16) ^ h) | 0;
  };
  const pseudoSort = (arr: Musician[]) =>
    [...arr].sort((a, b) => hash(a.id) - hash(b.id));

  const otherMusicians = pseudoSort(candidates).slice(0, 8);

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      musician,
      relatedVideos,
      otherMusicians,
      musicianCampYear,
    },
  };
}

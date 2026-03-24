import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import nextI18NextConfig from '../../../next-i18next.config';
import { Track } from '@/types/track';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import { getMusicRecordingSchema, getBreadcrumbSchema } from '@/utils/structuredData';
import PageLayout from '@/components/layout/PageLayout';

interface TrackPageProps {
  track: Track;
  musician: Musician | null;
}

export default function TrackPage({ track, musician }: TrackPageProps) {
  const { t, i18n } = useTranslation();

  const recordingSchema = {
    ...getMusicRecordingSchema({
      name: track.title,
      description: track.description,
      duration: track.duration,
      url: `https://peaceandmusic.net/album/tracks/${track.id}`,
    }, i18n.language),
    audio: {
      '@type': 'AudioObject',
      contentUrl: `https://peaceandmusic.net${track.audioUrl}`,
      encodingFormat: 'audio/mpeg',
    },
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: t('nav.home'), url: 'https://peaceandmusic.net/' },
    { name: t('nav.album'), url: 'https://peaceandmusic.net/album/about' },
    { name: t('nav.track'), url: 'https://peaceandmusic.net/album/tracks' },
    { name: track.title, url: `https://peaceandmusic.net/album/tracks/${track.id}` },
  ]);

  return (
    <PageLayout
      title={`${track.title} - ${track.artist} | ${t('app.title')}`}
      description={(track.description || '').slice(0, 160)}
      keywords={`${track.title}, ${track.artist}, ${t('app.title')}, lyrics`}
      ogImage={track.imageUrl || undefined}
      structuredData={[recordingSchema, breadcrumbSchema]}
      disableTopPadding={true}
    >
      {/* Hero */}
      <div className="bg-gradient-to-b from-jeju-ocean to-ocean-mist pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            {/* Album art */}
            {track.imageUrl && (
              <div className="w-full md:w-[300px] flex-shrink-0">
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={track.imageUrl}
                    alt={track.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Track info */}
            <div className="flex-1 text-white">
              <p className="text-sm uppercase tracking-wide text-white/70 mb-2">
                {t('common.track')} {track.id}
              </p>
              <h1 className="typo-h1 mb-2">{track.title}</h1>
              <p className="text-xl text-golden-sun mb-4">
                {musician ? (
                  <Link
                    href={`/album/musicians/${musician.id}`}
                    className="hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded"
                  >
                    {track.artist}
                  </Link>
                ) : (
                  track.artist
                )}
              </p>
              <p className="text-white/70 text-sm">{track.duration}</p>

              {/* Audio player */}
              <div className="mt-6">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls className="w-full" preload="none">
                  <source src={track.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Description */}
            <section className="mb-12">
              <h2 className="typo-h2 text-jeju-ocean mb-4">{t('common.about')}</h2>
              <p className="typo-body text-gray-700 leading-relaxed whitespace-pre-wrap text-pretty">
                {track.description}
              </p>
            </section>

            {/* Lyrics */}
            {track.lyrics && (
              <section className="mb-12">
                <h2 className="typo-h2 text-jeju-ocean mb-4">{t('common.lyrics')}</h2>
                <div className="bg-ocean-sand/30 rounded-xl p-8">
                  <p className="text-gray-800 leading-loose whitespace-pre-wrap font-serif font-bold text-lg">
                    {track.lyrics}
                  </p>
                </div>
              </section>
            )}

            {/* Credits */}
            {track.credits && (
              <section className="mb-12">
                <h2 className="typo-h2 text-jeju-ocean mb-4">{t('common.credits')}</h2>
                <div className="space-y-3">
                  {track.credits.composer && track.credits.composer.length > 0 && (
                    <div>
                      <span className="text-sm uppercase tracking-wide text-gray-500">{t('common.composer')}</span>
                      <p className="text-gray-800">{track.credits.composer.join(', ')}</p>
                    </div>
                  )}
                  {track.credits.lyricist && track.credits.lyricist.length > 0 && (
                    <div>
                      <span className="text-sm uppercase tracking-wide text-gray-500">{t('common.lyricist')}</span>
                      <p className="text-gray-800">{track.credits.lyricist.join(', ')}</p>
                    </div>
                  )}
                  {track.credits.arranger && track.credits.arranger.length > 0 && (
                    <div>
                      <span className="text-sm uppercase tracking-wide text-gray-500">{t('common.arranger')}</span>
                      <p className="text-gray-800">{track.credits.arranger.join(', ')}</p>
                    </div>
                  )}
                  {track.credits.personnel?.map((p, i) => (
                    <div key={i}>
                      <span className="text-sm uppercase tracking-wide text-gray-500">{p.role}</span>
                      <p className="text-gray-800">{p.name.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Navigation */}
            <div className="pt-8 border-t border-gray-200 flex flex-wrap gap-4">
              <Link
                href="/album/tracks"
                className="inline-flex items-center px-4 py-2 bg-ocean-sand text-jeju-ocean rounded-lg hover:bg-ocean-mist transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
              >
                &larr; {t('nav.track')}
              </Link>
              {musician && (
                <Link
                  href={`/album/musicians/${musician.id}`}
                  className="inline-flex items-center px-4 py-2 bg-golden-sun text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
                >
                  {musician.name} &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const tracks = loadLocalizedData<Track>('ko', 'tracks.json');
  const paths = (locales || ['ko']).flatMap((locale) =>
    tracks.map((t) => ({
      params: { id: String(t.id) },
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
  const tracks = loadLocalizedData<Track>(resolvedLocale, 'tracks.json');
  const track = tracks.find((t) => String(t.id) === params?.id);

  if (!track) {
    return { notFound: true };
  }

  const musicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json');
  const musician = musicians.find((m) => m.trackTitle === track.title) || null;

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      track,
      musician,
    },
    revalidate: 3600,
  };
}

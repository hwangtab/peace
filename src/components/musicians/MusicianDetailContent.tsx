import React from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { Musician } from '../../types/musician';
import { VideoItem } from '../../types/video';
import { getProfilePageSchema, getBreadcrumbSchema } from '../../utils/structuredData';
import { extractInstagramUsername } from '../../utils/instagram';
import PageLayout from '../layout/PageLayout';
import MusicianCard from './MusicianCard';
import VideoCard from '../videos/VideoCard';
import InstagramIcon from '../icons/InstagramIcon';
import YouTubeIcon from '../icons/YouTubeIcon';
import WaveDivider from '../common/WaveDivider';

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

  const pageTitle = isCampPage
    ? `${musician.name} — ${t('camp.title_2026')} | ${t('nav.logo')}`
    : `${musician.name} | ${t('app.title')}`;

  const pageDescription = isCampPage
    ? `${musician.shortDescription} ${t('camp.seo_musician_suffix')}`
    : musician.shortDescription;

  const baseKeywords = `${musician.name}, ${musician.genre.join(', ')}, ${t('app.title')}`;
  const pageKeywords = isCampPage
    ? `${baseKeywords}, 강정피스앤뮤직캠프, 2026, 강정마을, 평화음악축제`
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
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-jeju-ocean to-ocean-mist min-h-[420px] flex items-end">
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

              <div className="flex-1 text-white pb-2">
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

                {musician.trackTitle && (
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-widest text-white/60 mb-1">
                      {t('common.album_track_label')}
                    </p>
                    <Link
                      href="/album/tracks"
                      className="text-golden-sun hover:text-yellow-300 transition-colors text-lg font-medium"
                    >
                      {musician.trackTitle}
                    </Link>
                  </div>
                )}

                {(musician.instagramUrls.length > 0 || musician.youtubeUrl || fundingUrl) && (
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
                          <InstagramIcon className="w-4 h-4 mr-1.5" />@{username}
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
                    {fundingUrl && (
                      <a
                        href={`${fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=musician-hero-${musician.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-golden-sun text-gray-900 font-medium rounded-full hover:bg-yellow-400 transition-colors"
                      >
                        {t('camp.ticketing_2026')}
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

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href={backHref}
                className="inline-flex items-center px-5 py-2.5 bg-ocean-sand text-jeju-ocean rounded-lg hover:bg-ocean-mist transition-colors text-sm font-medium"
              >
                &larr; {backLabel}
              </Link>
              {musician.trackTitle && (
                <Link
                  href="/album/tracks"
                  className="inline-flex items-center px-5 py-2.5 bg-golden-sun text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors text-sm font-medium"
                >
                  {t('common.album_track_button')} &rarr;
                </Link>
              )}
              {fundingUrl && (
                <a
                  href={`${fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=musician-${musician.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 bg-jeju-ocean text-white rounded-lg hover:bg-ocean-mist transition-colors text-sm font-medium"
                >
                  {t('camp.ticketing_2026')} &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {relatedVideos.length > 0 && (
        <WaveDivider className="text-ocean-sand -mt-[60px] sm:-mt-[100px] relative z-10" />
      )}

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div className="bg-ocean-sand py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="typo-h2 text-jeju-ocean text-center mb-10">{t('nav.video')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {relatedVideos.length > 0 && otherMusicians.length > 0 && (
        <WaveDivider className="text-white -mt-[60px] sm:-mt-[100px] relative z-10" />
      )}

      {/* Other Musicians */}
      {otherMusicians.length > 0 && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="typo-h2 text-jeju-ocean text-center mb-10">
              {otherMusiciansTitle || t('nav.musician')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {otherMusicians.slice(0, Math.floor(otherMusicians.length / 3) * 3).map((m, i) => (
                <MusicianCard
                  key={m.id}
                  musician={m}
                  index={i}
                  href={`${musicianHrefPrefix}/${m.id}`}
                />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href={backHref}
                className="inline-flex items-center px-6 py-3 bg-jeju-ocean text-white rounded-lg hover:bg-ocean-mist transition-colors font-medium"
              >
                {backLabel} &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

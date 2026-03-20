import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { extractInstagramUsername } from '@/utils/instagram';
import InstagramIcon from '../icons/InstagramIcon';
import YouTubeIcon from '../icons/YouTubeIcon';

interface MusicianHeroSectionProps {
  musician: Musician;
  fundingUrl?: string;
  isCampPage: boolean;
}

export default function MusicianHeroSection({ musician, fundingUrl, isCampPage }: MusicianHeroSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="relative bg-gradient-to-b from-jeju-ocean to-ocean-mist min-h-[480px] flex items-center">
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
      <div className="relative z-10 w-full pt-24 pb-12">
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

            <div className="flex-1 min-w-0 text-white pb-2">
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

              <h1 className="typo-h1 mb-5 leading-tight break-words">{musician.name}</h1>

              {!isCampPage && musician.trackTitle && (
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

              {(musician.instagramUrls.length > 0 || musician.youtubeUrl) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {musician.instagramUrls.map((url) => {
                    const username = extractInstagramUsername(url);
                    return (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors max-w-full"
                      >
                        <InstagramIcon className="w-4 h-4 mr-1.5 flex-shrink-0" /><span className="truncate">@{username}</span>
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

              {fundingUrl && (
                <a
                  href={`${fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=musician-hero-${musician.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 text-sm bg-golden-sun text-gray-900 font-bold rounded-full hover:bg-yellow-400 transition-colors shadow-md"
                >
                  {t('camp.ticketing_2026')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

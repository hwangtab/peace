import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { CampEvent } from '@/types/camp';
import Button from '../common/Button';

interface MusicianDescriptionSectionProps {
  musician: Musician;
  backHref: string;
  backLabel: string;
  fundingUrl?: string;
  isCampPage: boolean;
  camp2026?: CampEvent;
}

export default function MusicianDescriptionSection({
  musician,
  backHref,
  backLabel,
  fundingUrl,
  isCampPage,
  camp2026,
}: MusicianDescriptionSectionProps) {
  const { t } = useTranslation();

  return (
    <div className={`bg-white pt-16 ${isCampPage && camp2026 && fundingUrl ? 'pb-24 md:pb-32' : 'pb-16'} flex-1`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <p className="typo-body text-gray-700 leading-relaxed whitespace-pre-wrap text-pretty break-words">
            {musician.description}
          </p>

          {!isCampPage && (
            <div className="mt-12 flex flex-wrap gap-4">
              <Button to={backHref} variant="back" size="sm" shape="rounded">
                &larr; {backLabel}
              </Button>
              {musician.trackTitle && (
                <Button to="/album/tracks" variant="gold" size="sm" shape="rounded">
                  {t('common.album_track_button')} &rarr;
                </Button>
              )}
              {fundingUrl && (
                <Button href={fundingUrl} variant="primary" size="sm" shape="rounded" external utmContent={`musician-${musician.id}`}>
                  {t('camp.ticketing_2026')} &rarr;
                </Button>
              )}
            </div>
          )}

          {isCampPage && camp2026 && fundingUrl && (
            <div className="mt-12 rounded-2xl overflow-hidden border border-ocean-mist/50 shadow-md flex flex-col sm:flex-row">
              {camp2026.images?.[0] && (
                <a
                  href={`${fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=musician-camp-info-${musician.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:w-[180px] flex-shrink-0 block"
                >
                  <div className="relative w-full h-44 sm:h-full min-h-[160px]">
                    <Image
                      src={camp2026.images[0]}
                      alt={t('camp.title_2026')}
                      fill
                      sizes="(max-width: 640px) 100vw, 180px"
                      className="object-cover"
                    />
                  </div>
                </a>
              )}
              <div className="flex-1 min-w-0 bg-gradient-to-br from-ocean-sand to-white px-6 py-6 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-widest text-jeju-ocean font-bold mb-2">{t('camp.title_2026')}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <span className="text-jeju-ocean">📅</span>{t('camp.date_badge_2026')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <span className="text-jeju-ocean">📍</span>{t('camp.venue_2026')}
                    </span>
                  </div>
                </div>
                <Button href={fundingUrl} variant="gold" size="sm" shape="rounded" external utmContent={`musician-camp-info-${musician.id}`} className="self-start">
                  {t('camp.ticketing_2026')} &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

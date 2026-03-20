import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { CampEvent } from '@/types/camp';

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
    <div className="bg-white pt-16 pb-16 flex-1">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <p className="typo-body text-gray-700 leading-relaxed whitespace-pre-wrap text-pretty">
            {musician.description}
          </p>

          {!isCampPage && (
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
          )}

          {isCampPage && camp2026 && fundingUrl && (
            <div className="mt-12 rounded-2xl overflow-hidden border border-ocean-sand shadow-sm flex flex-col sm:flex-row">
              {camp2026.images?.[0] && (
                <a
                  href={`${fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=musician-camp-info-${musician.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:w-[140px] flex-shrink-0 block"
                >
                  <div className="relative w-full h-40 sm:h-full min-h-[140px]">
                    <Image
                      src={camp2026.images[0]}
                      alt={t('camp.title_2026')}
                      fill
                      sizes="(max-width: 640px) 100vw, 140px"
                      className="object-cover"
                    />
                  </div>
                </a>
              )}
              <div className="flex-1 bg-ocean-sand px-6 py-5 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-jeju-ocean font-semibold mb-2">{t('camp.title_2026')}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                      <span className="text-jeju-ocean">📅</span>{t('camp.date_badge_2026')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                      <span className="text-jeju-ocean">📍</span>{t('camp.venue_2026')}
                    </span>
                  </div>
                </div>
                <a
                  href={`${fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=musician-camp-info-${musician.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start inline-flex items-center px-5 py-2.5 bg-jeju-ocean text-white rounded-lg hover:bg-ocean-mist transition-colors text-sm font-medium"
                >
                  {t('camp.ticketing_2026')} &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

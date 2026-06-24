import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { CampEvent } from '@/types/camp';
import { camps } from '@/data/camps';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '../common/Button';

interface MusicianDescriptionSectionProps {
  musician: Musician;
  backHref: string;
  backLabel: string;
  fundingUrl?: string;
  isCampPage: boolean;
  latestCamp?: CampEvent;
}

export default function MusicianDescriptionSection({
  musician,
  backHref,
  backLabel,
  fundingUrl,
  isCampPage,
  latestCamp,
}: MusicianDescriptionSectionProps) {
  const { t } = useTranslation();

  return (
    <Section
      background="white"
      paddingTop="normal"
      // 이 섹션 바로 뒤에 SectionWave(flow="up")가 와서 하단을 100px(데스크탑)
      // 끌어올려 잠식한다. normal(96px)은 물결에 묻히므로 항상 loose(128px)로
      // 물결이 차오를 여백을 확보한다.
      paddingBottom="loose"
      className="flex-1"
    >
      <Container size="prose">
        <p className="typo-body text-coastal-gray leading-relaxed whitespace-pre-wrap text-pretty break-words">
          {musician.description}
        </p>

        {!isCampPage && (
          <div className="mt-12 flex flex-wrap gap-4">
            <Button to={backHref} variant="back" size="sm" shape="rounded">
              &larr; {backLabel}
            </Button>
            {musician.trackTitle && (
              <Button
                to={musician.trackId ? `/album/tracks/${musician.trackId}` : '/album/tracks'}
                variant="gold"
                size="sm"
                shape="rounded"
              >
                {t('common.album_track_button')} &rarr;
              </Button>
            )}
            {fundingUrl && (
              <Button
                href={fundingUrl}
                variant="gold"
                size="sm"
                shape="rounded"
                external
                utmContent={`musician-${musician.id}`}
              >
                {t(`camp.ticketing_${latestCamp?.year ?? camps[camps.length - 1]?.year}`, {
                  defaultValue: t('camp.cta_final_button'),
                })}{' '}
                &rarr;
              </Button>
            )}
          </div>
        )}

        {isCampPage && latestCamp && fundingUrl && (
          <div className="mt-12 rounded-2xl overflow-hidden border border-ocean-mist/50 shadow-md flex flex-col sm:flex-row">
            {latestCamp.images?.[0] && (
              <a
                href={`${fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=musician-camp-info-${musician.id}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="sm:w-[180px] flex-shrink-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-lg"
              >
                <div className="relative w-full h-44 sm:h-full min-h-[160px]">
                  <Image
                    src={latestCamp.images[0]}
                    alt={t(`camp.title_${latestCamp?.year}`, { defaultValue: t('app.title') })}
                    fill
                    sizes="(max-width: 640px) 100vw, 180px"
                    className="object-cover"
                  />
                </div>
              </a>
            )}
            <div className="flex-1 min-w-0 bg-gradient-to-br from-ocean-sand to-white px-6 py-6 flex flex-col justify-between gap-4 text-center items-center">
              <div>
                <p className="text-sm uppercase tracking-widest text-jeju-ocean font-bold mb-2">
                  {t(`camp.title_${latestCamp?.year}`, { defaultValue: t('app.title') })}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-coastal-gray">
                    <span className="text-jeju-ocean" aria-hidden="true">
                      📅
                    </span>
                    {t(`camp.date_badge_${latestCamp?.year}`, { defaultValue: '' })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-coastal-gray">
                    <span className="text-jeju-ocean" aria-hidden="true">
                      📍
                    </span>
                    {t(`camp.venue_${latestCamp?.year}`, { defaultValue: '' })}
                  </span>
                </div>
              </div>
              <Button
                href={fundingUrl}
                variant="gold"
                size="sm"
                shape="rounded"
                external
                utmContent={`musician-camp-info-${musician.id}`}
                className="self-center"
              >
                {t(`camp.ticketing_${latestCamp?.year}`, {
                  defaultValue: t('camp.cta_final_button'),
                })}{' '}
                &rarr;
              </Button>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import classNames from 'classnames';
import { Musician } from '@/types/musician';
import { DarkSection, DarkLinkButton, Reveal, SectionHeading } from './DarkUI';

interface LineupArtist {
  key: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  /** 사이트 안 뮤지션 상세 페이지 — 없으면 외부 링크를 쓴다. */
  profileHref?: string;
  instagramUrl?: string;
}

/** 포스터의 배치 순서: 이서영 · 이형주 · 모레도토요일 · 모모. */
const MUSICIAN_ORDER: Array<{ key: string; id: number }> = [
  { key: 'leeseoyoung', id: 12 },
  { key: 'moredo', id: 7 },
  { key: 'momo', id: 10 },
];

const IHYEONGJU_IMAGE = '/images-webp/solidarity/lineup/ihyeongju.webp';
const IHYEONGJU_INSTAGRAM = 'https://www.instagram.com/hyungju1218/';

interface Props {
  musicians: Musician[];
}

/**
 * Lineup — 카드 그리드 대신 팀당 한 블록의 에디토리얼 레이아웃.
 *
 * 데스크톱에서는 사진과 텍스트가 좌우로 교차하고, 사진 옆에 세로쓰기 명조 이름을
 * 붙여 포스터의 세로 조판을 오마주한다. 모바일에서는 세로쓰기가 읽기 어렵고
 * 높이를 크게 잡아먹어 가로 제목으로 되돌린다.
 */
const Lineup: React.FC<Props> = ({ musicians }) => {
  const { t } = useTranslation('concert_ksfp_2026');

  const artists = useMemo<LineupArtist[]>(() => {
    const byId = new Map(musicians.map((m) => [m.id, m]));
    const fromCamp = MUSICIAN_ORDER.flatMap(({ key, id }) => {
      const m = byId.get(id);
      if (!m) return [];
      return [
        {
          key,
          name: m.name,
          description: m.description ?? m.shortDescription ?? '',
          imageUrl: m.imageUrl,
          imageAlt: m.name,
          profileHref: `/camps/2026/musicians/${m.id}`,
          instagramUrl: m.instagramUrls?.[0],
        } satisfies LineupArtist,
      ];
    });

    const ihyeongju: LineupArtist = {
      key: 'ihyeongju',
      name: t('artists.ihyeongju.name'),
      description: t('artists.ihyeongju.description'),
      imageUrl: IHYEONGJU_IMAGE,
      imageAlt: t('artists.ihyeongju.image_alt'),
      instagramUrl: IHYEONGJU_INSTAGRAM,
    };

    // 포스터 순서대로: 이서영, 이형주, 모레도토요일, 모모.
    const [first, ...rest] = fromCamp;
    return [...(first ? [first] : []), ihyeongju, ...rest];
  }, [musicians, t]);

  return (
    <DarkSection id="lineup" width="wide" ariaLabelledby="ksfp-lineup-heading">
      <SectionHeading
        id="ksfp-lineup-heading"
        eyebrow={t('lineup.eyebrow')}
        heading={t('lineup.heading')}
        subheading={t('lineup.subheading')}
      />

      <ul className="space-y-20 md:space-y-28">
        {artists.map((artist, index) => {
          const flipped = index % 2 === 1;
          return (
            <li key={artist.key}>
              <Reveal>
                <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
                  {/* 사진 + 세로쓰기 이름 */}
                  {/* 짝수 블록은 사진이 오른쪽으로 가므로 이름도 함께 뒤집어, 두 이름이
                      가운데 여백을 사이에 두고 마주 보게 한다(바깥으로 밀려나지 않게). */}
                  <div
                    className={classNames(
                      'relative mx-auto flex w-full max-w-[340px] items-stretch gap-5 lg:mx-0 lg:max-w-none',
                      flipped && 'lg:order-2 lg:flex-row-reverse'
                    )}
                  >
                    <div
                      className="relative w-full flex-1 overflow-hidden rounded-lg p-px"
                      style={{
                        background:
                          'linear-gradient(150deg, #CE1126 0%, #F5F1EA 38%, #007A3D 70%, rgba(10,10,10,0.9) 100%)',
                      }}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[7px] bg-[#141414]">
                        <Image
                          src={artist.imageUrl}
                          alt={artist.imageAlt}
                          fill
                          sizes="(max-width: 1024px) 90vw, 380px"
                          className="object-cover grayscale-[0.25] transition-[filter] duration-500 hover:grayscale-0"
                        />
                      </div>
                    </div>

                    {/* 세로쓰기 이름 — 데스크톱 전용(포스터 오마주) */}
                    <p
                      aria-hidden="true"
                      className="hidden shrink-0 select-none font-serif text-3xl leading-none tracking-[0.2em] text-[#F5F1EA]/85 lg:block"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                      {artist.name}
                    </p>
                  </div>

                  {/* 텍스트 */}
                  <div className={classNames('min-w-0', flipped && 'lg:order-1')}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#007A3D]">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-3 font-serif text-3xl text-[#F5F1EA] md:text-4xl">
                      {artist.name}
                    </h3>
                    <p className="mt-5 text-sm leading-[1.95] text-[#D7D1C7] md:text-base">
                      {artist.description}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      {artist.profileHref && (
                        <DarkLinkButton href={artist.profileHref} variant="outline" size="sm">
                          {t('lineup.link_profile')}
                        </DarkLinkButton>
                      )}
                      {artist.instagramUrl && (
                        <DarkLinkButton
                          href={artist.instagramUrl}
                          variant="quiet"
                          size="sm"
                          external
                        >
                          {t('lineup.link_instagram')}
                        </DarkLinkButton>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </DarkSection>
  );
};

export default Lineup;

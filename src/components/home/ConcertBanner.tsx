import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

/**
 * 홈 상단 공연 CTA 배너 — Keep Singing for Palestine (2026-09-19).
 *
 * 공연 다음 날(KST 2026-09-20 00:00)부터는 렌더하지 않는다. 날짜 판정은 순수 함수로
 * 분리해 테스트한다.
 */

const CONCERT_URL = '/solidarity/keep-singing-for-palestine';
const POSTER = '/images-webp/solidarity/keep-singing-for-palestine.webp';

/** 배너 노출 종료 시각 — 2026-09-20T00:00+09:00. */
const BANNER_END = Date.UTC(2026, 8, 19, 15, 0, 0);

/** 주어진 시각에 배너를 보여야 하는지 판정한다. */
export function isConcertBannerActive(now: Date): boolean {
  return now.getTime() < BANNER_END;
}

/**
 * 노출 여부는 홈의 getStaticProps 가 판정해 prop 으로 내려준다.
 * 렌더 중 `new Date()` 를 읽으면 SSR HTML 과 하이드레이션 결과가 갈릴 수 있어서다
 * (홈은 revalidate 3600 이라 최대 1시간 늦게 사라진다 — 이 배너에는 충분하다).
 */
const ConcertBanner: React.FC<{ active: boolean }> = ({ active }) => {
  const { t } = useTranslation('translation');

  if (!active) return null;

  return (
    <aside className="bg-[#0a0a0a] text-[#F5F1EA]">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 md:flex-nowrap md:gap-6 lg:px-8">
        <div className="relative hidden h-16 w-[52px] shrink-0 overflow-hidden rounded ring-1 ring-[#F5F1EA]/20 sm:block">
          <Image
            src={POSTER}
            alt={t('home.concert_banner.image_alt')}
            fill
            sizes="52px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E2566B]">
            <span>{t('home.concert_banner.label')}</span>
            <span className="rounded-full border border-[#007A3D] px-2 py-0.5 tracking-[0.14em] text-[#7FD8A6]">
              {t('home.concert_banner.status')}
            </span>
          </p>
          <p className="mt-1.5 font-serif text-base leading-snug text-[#F5F1EA] md:text-lg">
            {t('home.concert_banner.title')}
          </p>
        </div>

        <Link
          href={CONCERT_URL}
          className="shrink-0 rounded-full bg-[#F5F1EA] px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F1EA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
        >
          {t('home.concert_banner.cta')}
        </Link>
      </div>
    </aside>
  );
};

export default ConcertBanner;

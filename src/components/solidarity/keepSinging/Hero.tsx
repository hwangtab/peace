import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { DarkLinkButton, FlagRule, Reveal } from './DarkUI';

const POSTER = '/images-webp/solidarity/keep-singing-for-palestine-20260918.webp';

/**
 * Hero — 포스터의 "국기색이 반사되는 CD"를 배경 광택으로 옮긴 도입부.
 *
 * 예전에는 140vw 원에 blur(90px) 필터를 걸고 60초 무한 회전을 시켰는데,
 * 거대한 필터 레이어를 계속 변환·재래스터화해 스크롤 프레임을 잡아먹었다.
 * 지금은 필터 없이 여러 radial-gradient 를 겹쳐 같은 색 번짐을 정적으로 표현한다
 * (래스터 1회, 스크롤 중 추가 비용 없음).
 */
const Hero: React.FC = () => {
  const { t } = useTranslation('concert_ksfp_2026');

  return (
    <section className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
      {/* CD 반사광 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-10%] aspect-square w-[140vw] max-w-[1100px] -translate-x-1/2 rounded-full opacity-[0.38] md:w-[80vw]"
          style={{
            background:
              'radial-gradient(60% 60% at 32% 30%, rgba(206,17,38,0.85) 0%, rgba(206,17,38,0) 70%),' +
              'radial-gradient(55% 55% at 70% 36%, rgba(245,241,234,0.5) 0%, rgba(245,241,234,0) 72%),' +
              'radial-gradient(65% 65% at 56% 74%, rgba(0,122,61,0.8) 0%, rgba(0,122,61,0) 70%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/40 to-[#0a0a0a]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16 lg:px-8">
        {/* 포스터 */}
        <Reveal className="mx-auto w-full max-w-[360px] lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg ring-1 ring-[#F5F1EA]/15">
            <Image
              src={POSTER}
              alt={t('hero.poster_alt')}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* 타이틀 + 요약 */}
        <Reveal delayIndex={1}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C958B] md:text-xs">
            {t('hero.eyebrow')}
          </p>

          <h1
            className="mt-5 font-serif font-medium leading-[1.05] text-[#F5F1EA] [text-wrap:balance]"
            style={{ fontSize: 'clamp(2.4rem, 6.4vw, 4.6rem)' }}
          >
            Keep Singing
            <br />
            for Palestine
          </h1>

          <p className="mt-5 text-sm tracking-[0.24em] text-[#E2566B] md:text-base">
            {t('hero.subtitle')}
          </p>

          <FlagRule className="my-8" />

          <dl className="space-y-4 text-sm md:text-base">
            {(
              [
                ['hero.date_label', 'hero.date_value'],
                ['hero.venue_label', 'hero.venue_value'],
                ['hero.status_label', 'hero.status_value'],
              ] as const
            ).map(([labelKey, valueKey]) => (
              <div key={labelKey} className="flex flex-wrap gap-x-4 gap-y-1">
                <dt className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9C958B]">
                  {t(labelKey)}
                </dt>
                <dd className="min-w-0 flex-1 text-[#F5F1EA]">{t(valueKey)}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <DarkLinkButton href="#notice">{t('hero.cta_notice')}</DarkLinkButton>
            <DarkLinkButton href="#support" variant="outline">
              {t('hero.cta_support')}
            </DarkLinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Hero;

import React from 'react';
import { useTranslation } from 'next-i18next';
import { DarkLinkButton, DarkSection, FlagRule, Reveal, SectionHeading } from './DarkUI';
import { CONTACT_URL, KAKAO_MAP_URL, NAVER_MAP_URL } from './constants';

/**
 * 오시는 길 + 문의.
 *
 * 페이지의 마지막 블록이라 배경(#0a0a0a)을 푸터 직전까지 스스로 칠한다
 * (PageLayout 하단 띠 버그 방지 — 페이지 쪽에서 disableBottomPadding 도 함께 켠다).
 */
const Venue: React.FC = () => {
  const { t } = useTranslation('concert_ksfp_2026');

  return (
    <DarkSection id="venue" width="prose" ariaLabelledby="ksfp-venue-heading">
      <SectionHeading
        id="ksfp-venue-heading"
        eyebrow={t('venue.eyebrow')}
        heading={t('venue.heading')}
      />

      <Reveal>
        <p className="font-serif text-2xl text-[#F5F1EA] md:text-3xl">{t('venue.name')}</p>
        <p className="mt-3 text-sm text-[#D7D1C7] md:text-base">{t('venue.address')}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <DarkLinkButton href={NAVER_MAP_URL} variant="outline" size="sm" external>
            {t('venue.naver')}
          </DarkLinkButton>
          <DarkLinkButton href={KAKAO_MAP_URL} variant="outline" size="sm" external>
            {t('venue.kakao')}
          </DarkLinkButton>
        </div>
      </Reveal>

      <Reveal delayIndex={1}>
        <FlagRule className="my-12" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C958B]">
          {t('venue.contact_heading')}
        </p>
        <div className="mt-4">
          <DarkLinkButton href={CONTACT_URL} variant="quiet" size="sm" external>
            {t('venue.contact_cta')}
          </DarkLinkButton>
        </div>
      </Reveal>
    </DarkSection>
  );
};

export default Venue;

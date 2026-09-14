import React from 'react';
import { useTranslation } from 'next-i18next';
import { DarkCard, DarkSection, FlagRule, Reveal, SectionHeading } from './DarkUI';
import { FUNDING_URL } from './constants';

/**
 * 후원 안내.
 *
 * 2026-09-14까지는 계좌번호를 띄우고 입금을 받았다. 스튜디오 놀의 후원 페이지로 경로를
 * 옮겼다 — 카드·간편결제로 바로 후원할 수 있고, 금액에 따라 앨범 음원을 리워드로 받는다.
 * 입금자명 대조를 사람이 하지 않아도 되고, 환불도 그쪽 규정을 따른다.
 */
const Support: React.FC = () => {
  const { t } = useTranslation('concert_ksfp_2026');

  return (
    <DarkSection id="support" width="prose-center" ariaLabelledby="ksfp-support-heading">
      <SectionHeading
        id="ksfp-support-heading"
        eyebrow={t('support.eyebrow')}
        heading={t('support.heading')}
        align="center"
      />

      <Reveal>
        <DarkCard className="text-center">
          <p className="text-sm leading-relaxed text-[#D7D1C7] md:text-base">{t('support.intro')}</p>
          <FlagRule className="my-7" />
          <p className="text-sm leading-relaxed text-[#D7D1C7] md:text-base">{t('support.reward')}</p>
          {/* 다른 사이트(studionol.co.kr)로 나가는 링크라 새 탭으로 연다 — 집회 현장에서
              QR로 들어온 사람이 이 페이지를 잃지 않게. */}
          <a
            href={FUNDING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F5F1EA] px-8 font-semibold text-[#0a0a0a] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F1EA]/60"
          >
            {t('support.cta')}
          </a>
          <p className="mt-8 text-sm leading-relaxed text-[#9C958B]">{t('support.outro')}</p>
        </DarkCard>
      </Reveal>
    </DarkSection>
  );
};

export default Support;

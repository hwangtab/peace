import React from 'react';
import { useTranslation } from 'next-i18next';
import { DarkCard, DarkSection, FlagRule, Reveal, SectionHeading } from './DarkUI';

const PARA_KEYS = [
  'notice.para_1',
  'notice.para_2',
  'notice.para_3',
  'notice.para_4',
  'notice.para_5',
  'notice.para_6',
  'notice.para_7',
] as const;

const BLOCK_KEYS = ['musicians', 'speakers', 'guests', 'host'] as const;

/**
 * 기획 변경 공지 + 취지문.
 *
 * 2026-09-13, 조직위가 9/19 반쥴 공연을 거리 집회 참여로 전환하기로 하면서 추가했다.
 * 예매 접수 마감·환불 안내가 여기 걸리므로 Hero 바로 다음에 온다.
 */
const Notice: React.FC = () => {
  const { t } = useTranslation('concert_ksfp_2026');

  return (
    <DarkSection id="notice" width="prose" ariaLabelledby="ksfp-notice-heading">
      <SectionHeading
        id="ksfp-notice-heading"
        eyebrow={t('notice.eyebrow')}
        heading={t('notice.heading')}
        subheading={t('notice.subheading')}
      />

      {/* 예매자에게 가장 먼저 보여야 하는 환불 안내 */}
      <Reveal>
        <DarkCard className="border-[#CE1126]/50">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#E2566B]">
            {t('notice.refund_label')}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#F5F1EA] md:text-base">
            {t('notice.refund_body')}
          </p>
        </DarkCard>
      </Reveal>

      <Reveal delayIndex={1} className="mt-12">
        <div className="space-y-5">
          {PARA_KEYS.map((key) => (
            <p key={key} className="text-sm leading-relaxed text-[#D7D1C7] md:text-base">
              {t(key)}
            </p>
          ))}
        </div>
      </Reveal>

      <Reveal delayIndex={2}>
        <FlagRule className="my-12" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C958B]">
          {t('notice.audience_heading')}
        </p>
        <div className="mt-7 space-y-7">
          {BLOCK_KEYS.map((key) => (
            <div key={key} className="border-l border-[#CE1126]/60 pl-5">
              <h3 className="font-serif text-lg text-[#F5F1EA] md:text-xl">
                {t(`notice.block_${key}_heading`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#D7D1C7] md:text-base">
                {t(`notice.block_${key}_body`)}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </DarkSection>
  );
};

export default Notice;

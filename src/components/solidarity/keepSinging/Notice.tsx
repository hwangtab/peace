import React from 'react';
import { useTranslation } from 'next-i18next';
import { DarkCard, DarkSection, Reveal, SectionHeading } from './DarkUI';

/** 기획 변경 배경 — 계획(①②③) 앞에 오는 문단. */
const LEAD_PARA_KEYS = ['notice.para_1', 'notice.para_2', 'notice.para_3'] as const;

/** 바뀐 기획 세 가지. */
const PLAN_KEYS = ['notice.plan_1', 'notice.plan_2', 'notice.plan_3'] as const;

/** 계획 뒤에 오는 맺음 문단. */
const CLOSING_PARA_KEYS = ['notice.para_4', 'notice.para_5'] as const;

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
          {LEAD_PARA_KEYS.map((key) => (
            <p key={key} className="text-sm leading-relaxed text-[#D7D1C7] md:text-base">
              {t(key)}
            </p>
          ))}
        </div>
      </Reveal>

      {/* 바뀐 기획 — 본문보다 한 단 들여 눈에 띄게 둔다. */}
      <Reveal delayIndex={2} className="mt-9">
        <ol className="space-y-4">
          {PLAN_KEYS.map((key, i) => (
            <li key={key} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-[0.1em] shrink-0 font-serif text-lg text-[#E2566B] md:text-xl"
              >
                {`${i + 1}.`}
              </span>
              <span className="text-sm leading-relaxed text-[#F5F1EA] md:text-base">{t(key)}</span>
            </li>
          ))}
        </ol>
        <p className="mt-7 border-l border-[#CE1126]/60 pl-5 text-sm leading-relaxed text-[#9C958B] md:text-base">
          {t('notice.plan_note')}
        </p>
      </Reveal>

      <Reveal delayIndex={3} className="mt-9">
        <div className="space-y-5">
          {CLOSING_PARA_KEYS.map((key) => (
            <p key={key} className="text-sm leading-relaxed text-[#D7D1C7] md:text-base">
              {t(key)}
            </p>
          ))}
        </div>
      </Reveal>
    </DarkSection>
  );
};

export default Notice;

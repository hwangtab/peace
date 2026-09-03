import React from 'react';
import { useTranslation } from 'next-i18next';
import CopyButton from '@/components/common/CopyButton';
import { DarkCard, DarkSection, FlagRule, Reveal, SectionHeading } from './DarkUI';
import { ACCOUNT_TEXT } from './constants';

/** 후원 계좌 안내. */
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
          <p className="text-sm leading-relaxed text-[#D7D1C7] md:text-base">
            {t('support.intro')}
          </p>
          <FlagRule className="my-7" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C958B]">
            {t('support.account_label')}
          </p>
          <p className="mt-3 break-words font-serif text-xl text-[#F5F1EA] md:text-2xl">
            {ACCOUNT_TEXT}
          </p>
          <CopyButton
            text={ACCOUNT_TEXT}
            label={t('support.copy')}
            copiedLabel={t('support.copied')}
            className="mt-6 !bg-[#F5F1EA] !text-[#0a0a0a] hover:!bg-white"
          />
          <p className="mt-8 text-sm leading-relaxed text-[#9C958B]">{t('support.outro')}</p>
        </DarkCard>
      </Reveal>
    </DarkSection>
  );
};

export default Support;

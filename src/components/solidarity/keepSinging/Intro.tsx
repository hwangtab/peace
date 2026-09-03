import React from 'react';
import { useTranslation } from 'next-i18next';
import { DarkSection, FlagRule, Reveal } from './DarkUI';

/** 소개문 + 인용구 + 같은 날 집회 안내. */
const Intro: React.FC = () => {
  const { t } = useTranslation('concert_ksfp_2026');

  return (
    <DarkSection width="prose" ariaLabelledby="ksfp-intro-heading">
      <h2 id="ksfp-intro-heading" className="sr-only">
        {t('intro.heading')}
      </h2>

      <div className="space-y-6">
        {(['intro.para_1', 'intro.para_2', 'intro.para_3'] as const).map((key, i) => (
          <Reveal key={key} delayIndex={i}>
            <p className="text-base leading-[1.9] text-[#D7D1C7] md:text-lg">{t(key)}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delayIndex={3} className="my-14 md:my-20">
        <FlagRule className="mb-10" />
        <blockquote className="text-center font-serif leading-tight text-[#F5F1EA]">
          <p style={{ fontSize: 'clamp(1.6rem, 4.4vw, 2.75rem)' }}>{t('intro.quote_line_1')}</p>
          <p className="mt-2 text-[#007A3D]" style={{ fontSize: 'clamp(1.6rem, 4.4vw, 2.75rem)' }}>
            {t('intro.quote_line_2')}
          </p>
        </blockquote>
        <FlagRule className="mt-10" />
      </Reveal>

      <Reveal delayIndex={4}>
        <div className="rounded-2xl border border-[#CE1126]/40 bg-[#CE1126]/[0.07] p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#E2566B]">
            {t('rally.eyebrow')}
          </p>
          <h3 className="mt-3 font-serif text-xl text-[#F5F1EA] md:text-2xl">
            {t('rally.heading')}
          </h3>
          <p className="mt-4 text-sm leading-[1.9] text-[#D7D1C7] md:text-base">
            {t('rally.body')}
          </p>
        </div>
      </Reveal>
    </DarkSection>
  );
};

export default Intro;

import React from 'react';
import { useTranslation } from 'next-i18next';
import { DarkCard, DarkSection, Reveal, SectionHeading } from './DarkUI';

/** 사전 예매 / 현장 구매 가격과 마감·환불 안내. */
const Tickets: React.FC = () => {
  const { t } = useTranslation('concert_ksfp_2026');

  return (
    <DarkSection id="tickets" ariaLabelledby="ksfp-tickets-heading">
      <SectionHeading
        id="ksfp-tickets-heading"
        eyebrow={t('tickets.eyebrow')}
        heading={t('tickets.heading')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Reveal>
          <DarkCard className="h-full border-[#007A3D]/45">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#007A3D]">
              {t('tickets.advance_label')}
            </p>
            <p className="mt-3 font-serif text-4xl text-[#F5F1EA]">{t('tickets.advance_price')}</p>
          </DarkCard>
        </Reveal>
        <Reveal delayIndex={1}>
          <DarkCard className="h-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C958B]">
              {t('tickets.door_label')}
            </p>
            <p className="mt-3 font-serif text-4xl text-[#D7D1C7]">{t('tickets.door_price')}</p>
          </DarkCard>
        </Reveal>
      </div>

      <Reveal delayIndex={2} className="mt-8">
        <ul className="space-y-3 text-sm leading-relaxed text-[#D7D1C7] md:text-base">
          {(['tickets.note_order', 'tickets.note_refund', 'tickets.note_limit'] as const).map(
            (key) => (
              <li key={key} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 bg-[#E2566B]" />
                <span>{t(key)}</span>
              </li>
            )
          )}
        </ul>
      </Reveal>
    </DarkSection>
  );
};

export default Tickets;

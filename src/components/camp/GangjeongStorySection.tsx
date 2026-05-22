import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import Section from '@/components/layout/Section';
import {
  HookStatement,
  ImpactNumbers,
  GangjeongTimeline,
  EmotionalStory,
  GlobalSolidarity,
} from './gangjeong-story';

export type GangjeongVariant = 'camp' | 'home';

interface Props {
  variant?: GangjeongVariant;
}

const GangjeongStorySection: React.FC<Props> = ({ variant = 'camp' }) => {
  const { t } = useTranslation('gangjeong');

  if (variant === 'home') {
    return (
      <section aria-label={t('section_aria_label')} className="overflow-hidden">
        <HookStatement variant="home" />
        <ImpactNumbers variant="home" />
        <GangjeongTimeline variant="home" />
        <Section background="sky-horizon" paddingTop="none" paddingBottom="tight" className="-mt-px text-center">
          <Link
            href="/camps/2026"
            className="group inline-flex items-center gap-2 text-jeju-ocean hover:text-ocean-mist font-caption tracking-wide text-sm sm:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded"
          >
            <span>{t('home_cta')}</span>
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </Section>
      </section>
    );
  }

  return (
    <section aria-label={t('section_aria_label')} className="overflow-hidden">
      <HookStatement variant="camp" />
      <ImpactNumbers variant="camp" />
      <GangjeongTimeline variant="camp" />
      <EmotionalStory variant="camp" />
      <GlobalSolidarity variant="camp" />
    </section>
  );
};

export default GangjeongStorySection;

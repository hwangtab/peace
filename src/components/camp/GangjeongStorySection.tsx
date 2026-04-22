import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation();

  if (variant === 'home') {
    return (
      <section aria-label={t('gangjeong_story.section_aria_label')} className="overflow-hidden">
        <HookStatement variant="home" />
        <ImpactNumbers variant="home" />
        <GangjeongTimeline variant="home" />
        <div className="bg-sky-horizon pb-16 sm:pb-20 -mt-px text-center">
          <Link
            href="/camps/2026"
            className="group inline-flex items-center gap-2 text-jeju-ocean hover:text-ocean-mist font-caption tracking-wide text-sm sm:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded"
          >
            <span>{t('gangjeong_story.home_cta')}</span>
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-label={t('gangjeong_story.section_aria_label')} className="overflow-hidden">
      <HookStatement variant="camp" />
      <ImpactNumbers variant="camp" />
      <GangjeongTimeline variant="camp" />
      <EmotionalStory variant="camp" />
      <GlobalSolidarity variant="camp" />
    </section>
  );
};

export default GangjeongStorySection;

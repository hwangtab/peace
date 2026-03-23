import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  HookStatement,
  ImpactNumbers,
  GangjeongTimeline,
  EmotionalStory,
  GlobalSolidarity,
} from './gangjeong-story';

const GangjeongStorySection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section aria-label={t('gangjeong_story.section_aria_label')} className="overflow-hidden">
      <HookStatement />
      <ImpactNumbers />
      <GangjeongTimeline />
      <EmotionalStory />
      <GlobalSolidarity />
    </section>
  );
};

export default GangjeongStorySection;

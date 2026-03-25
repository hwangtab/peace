import React from 'react';
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

  return (
    <section aria-label={t('gangjeong_story.section_aria_label')} className="overflow-hidden">
      <HookStatement variant={variant} />
      <ImpactNumbers variant={variant} />
      <GangjeongTimeline variant={variant} />
      <EmotionalStory variant={variant} />
      <GlobalSolidarity variant={variant} />
    </section>
  );
};

export default GangjeongStorySection;

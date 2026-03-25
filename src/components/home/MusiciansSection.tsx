import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';
import MusicianCard from '../musicians/MusicianCard';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import React from 'react';

interface MusiciansSectionProps {
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const MusiciansSection: React.FC<MusiciansSectionProps> = React.memo(
  ({ enableSectionWrapper = true, hideSectionHeader = false, initialMusicians = [], initialLocale = 'ko' }) => {
    const { t, i18n } = useTranslation();

    const [musicians, setMusicians] = useState<Musician[]>(initialMusicians);
    const [isLoading, setIsLoading] = useState(initialMusicians.length === 0);

    // Load musicians data on mount or when language changes
    useEffect(() => {
      if (i18n.language === initialLocale && initialMusicians.length > 0) {
        setMusicians(initialMusicians);
        setIsLoading(false);
        return;
      }

      let isCancelled = false;

      const loadMusicians = async () => {
        setIsLoading(true);
        try {
          const data = await getMusicians(i18n.language);
          if (!isCancelled) {
            setMusicians(data);
          }
        } catch (error) {
          console.error('Failed to load musicians:', error);
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      loadMusicians();

      return () => {
        isCancelled = true;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n.language, initialLocale, initialMusicians.length]);

    const content = (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {!hideSectionHeader && (
          <SectionHeader
            title={t('home.musicians.title')}
            subtitle={t('home.musicians.subtitle')}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20" role="status">
            <div className="motion-safe:animate-spin rounded-full h-12 w-12 border-b-2 border-jeju-ocean" />
            <span className="sr-only">{t('common.loading')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {musicians.map((musician, index) => (
              <MusicianCard key={musician.id} musician={musician} index={index} />
            ))}
          </div>
        )}
      </div>
    );

    if (enableSectionWrapper) {
      return (
        <Section id="musicians" background="white">
          {content}
        </Section>
      );
    }

    return <div>{content}</div>;
  }
);

MusiciansSection.displayName = 'MusiciansSection';
export default MusiciansSection;

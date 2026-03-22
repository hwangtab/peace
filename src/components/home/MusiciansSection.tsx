import { useTranslation } from 'next-i18next';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
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
    const ref = useRef(null);
    const inView = useInView(ref, {
      once: true,
      amount: 0.1,
    });

    const [musicians, setMusicians] = useState<Musician[]>(initialMusicians);
    const [isLoading, setIsLoading] = useState(initialMusicians.length === 0);

    // Load musicians data on mount or when language changes
    useEffect(() => {
      if (i18n.language === initialLocale && musicians.length > 0) {
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
    }, [i18n.language, initialLocale]);

    const content = (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {!hideSectionHeader && (
          <SectionHeader
            title={t('home.musicians.title')}
            subtitle={t('home.musicians.subtitle')}
            inView={inView}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jeju-ocean" />
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
        <Section id="musicians" background="white" ref={ref}>
          {content}
        </Section>
      );
    }

    return <div ref={ref}>{content}</div>;
  }
);

MusiciansSection.displayName = 'MusiciansSection';
export default MusiciansSection;

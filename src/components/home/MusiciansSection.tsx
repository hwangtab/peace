import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import Link from 'next/link';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';
import MusicianCard from '../musicians/MusicianCard';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import React from 'react';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface MusiciansSectionProps {
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const MusiciansSection: React.FC<MusiciansSectionProps> = React.memo(
  ({
    enableSectionWrapper = true,
    hideSectionHeader = false,
    initialMusicians = [],
    initialLocale = 'ko',
  }) => {
    const { t, i18n } = useTranslation();

    const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
    const musiciansResource = useLocalizedResource<Musician>({
      initialData: initialMusicians,
      initialLocale,
      currentLocale: i18n.language,
      fetchResource: fetchMusicians,
    });

    const musicians = musiciansResource.data;
    const isLoading = musiciansResource.isLoading;
    const loadingError = musiciansResource.error;

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
        ) : loadingError ? (
          <p className="text-center text-gray-600 py-10" role="alert">
            {t('common.no_results')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {musicians.map((musician, index) => (
                <MusicianCard key={musician.id} musician={musician} index={index} />
              ))}
            </div>
            {enableSectionWrapper && (
              <div className="text-center mt-8">
                <Link
                  href="/album/musicians"
                  className="inline-flex items-center gap-1 text-jeju-ocean hover:text-ocean-mist font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded"
                >
                  {t('nav.musician')} →
                </Link>
              </div>
            )}
          </>
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

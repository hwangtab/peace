import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { getPressItems, normalizePressItems } from '@/api/press';
import { PressItem } from '@/types/press';
import { getBreadcrumbSchema, getNewsArticleSchema } from '@/utils/structuredData';
import Button from '@/components/common/Button';
import { getCamps } from '@/data/camps';
import { FilterId, filterByEvent } from '@/utils/filtering';
import { sortByDateDesc } from '@/utils/sorting';
import EventFilter from '../common/EventFilter';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '../common/PageHero';
import { getFullUrl } from '@/config/env';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface PressPageProps {
  initialPressItems?: PressItem[];
  initialLocale?: string;
}

const PressCard: React.FC<{ press: PressItem }> = ({ press }) => {
  const [imgSrc, setImgSrc] = useState(press.imageUrl || '');

  return (
    <a
      href={press.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
    >
      <article className="bg-white rounded-xl shadow-md overflow-hidden transition-[box-shadow,transform] duration-300 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col">
        {imgSrc && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={imgSrc}
              alt={press.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
              unoptimized
              onError={() => {
                if (imgSrc.endsWith('.jpeg')) {
                  setImgSrc(imgSrc.replace('.jpeg', '.jpg'));
                } else {
                  setImgSrc('');
                }
              }}
            />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
            <span>{press.publisher}</span>
            <span>{press.date}</span>
          </div>
          <h3 className="typo-h3 hover:text-jeju-ocean transition-colors duration-200">
            {press.title}
          </h3>
          <p className="typo-body mt-2 flex-1 text-pretty break-words">{press.description}</p>
        </div>
      </article>
    </a>
  );
};

export default function PressPage({
  initialPressItems = [],
  initialLocale = 'ko',
}: PressPageProps) {
  const { t, i18n } = useTranslation();
  const camp2026 = getCamps(i18n.language, t).find((c) => c.id === 'camp-2026');
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('all');

  const fetchPress = useCallback((locale: string) => getPressItems(locale), []);
  const pressResource = useLocalizedResource<PressItem>({
    initialData: initialPressItems,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchPress,
  });

  const pressItems = useMemo(() => normalizePressItems(pressResource.data), [pressResource.data]);

  const breadcrumbs = [
    { name: t('press.breadcrumb_home'), url: getFullUrl('/') },
    { name: t('press.breadcrumb_press'), url: getFullUrl('/press') },
  ];

  const structuredData = [
    getBreadcrumbSchema(breadcrumbs),
    ...pressItems.slice(0, 10).map(item =>
      getNewsArticleSchema({
        headline: item.title,
        description: item.description || '',
        datePublished: item.date,
        url: item.url,
        imageUrl: item.imageUrl,
      }, i18n.language, t)
    ),
  ];

  const filteredItems = useMemo(
    () => sortByDateDesc(filterByEvent(pressItems, selectedFilter)),
    [pressItems, selectedFilter]
  );

  return (
    <PageLayout
      title={t('press.page_title')}
      description={t('press.page_desc')}
      keywords={t('press.keywords')}
      ogImage="/images-webp/camps/2023/DSC00610.webp"
      structuredData={structuredData}
      background="ocean-sand"
      disableTopPadding={true}
    >
      <PageHero
        title={t('press.hero_title')}
        subtitle={t('press.hero_subtitle')}
        backgroundImage="/images-webp/camps/2023/DSC00610.webp"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <EventFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          colorScheme="orange"
          filterOrder="press"
        />
        {pressResource.isLoading && (
          <p className="text-center text-gray-500 py-12" role="status">
            {t('common.loading')}
          </p>
        )}
        {!pressResource.error && !pressResource.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((press) => (
              <div key={press.id} className="h-full">
                <PressCard press={press} />
              </div>
            ))}
          </div>
        )}
        {pressResource.error && (
          <p className="text-center text-gray-500 py-12" role="alert">
            {t('common.no_results')}
          </p>
        )}
        {filteredItems.length === 0 && !pressResource.error && !pressResource.isLoading && (
          <p className="text-center text-gray-500 py-12">
            {t('common.no_results') || 'No results found.'}
          </p>
        )}

        {/* Camp 2026 CTA */}
        {camp2026?.fundingUrl && (
          <div className="mt-16 bg-jeju-ocean rounded-xl py-8 px-6 text-center">
            <p className="text-white text-lg font-medium mb-4 break-words">
              {t('camp.title_2026')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button to="/camps/2026" variant="ghost-white" size="sm">
                {t('camp.view_detail')}
              </Button>
              <Button
                href={camp2026.fundingUrl}
                variant="gold"
                size="sm"
                external
                utmContent="press"
              >
                {t('camp.ticketing_2026')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

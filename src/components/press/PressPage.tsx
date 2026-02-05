import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PressItem, getPressItems } from '../../data/press';
import { getBreadcrumbSchema } from '../../utils/structuredData';
import { filterByEvent } from '../../utils/filtering';
import { sortByDateDesc } from '../../utils/sorting';
import EventFilter from '../common/EventFilter';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../common/PageHero';


const PressCard: React.FC<{ press: PressItem }> = ({ press }) => {
  return (
    <a
      href={press.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full cursor-pointer"
    >
      <article className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col">
        {press.imageUrl && (
          <div className="h-48 overflow-hidden">
            <img
              src={press.imageUrl}
              alt={press.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src.endsWith('.jpeg')) {
                  img.src = img.src.replace('.jpeg', '.jpg');
                }
              }}
            />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">{press.publisher}</span>
            <span className="text-sm text-gray-500">{press.date}</span>
          </div>
          <h3 className="typo-h3 hover:text-jeju-ocean transition-colors duration-200">
            {press.title}
          </h3>
          <p className="typo-body mt-2 flex-1 text-pretty">{press.description}</p>
        </div>
      </article>
    </a>
  );
};

export default function PressPage() {
  const { t, i18n } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const pressItems = useMemo(() => getPressItems(i18n.language), [i18n.language]);

  const breadcrumbs = [
    { name: t('press.breadcrumb_home'), url: "https://peaceandmusic.net/" },
    { name: t('press.breadcrumb_press'), url: "https://peaceandmusic.net/press" }
  ];

  const structuredData = [
    getBreadcrumbSchema(breadcrumbs)
  ];

  const filteredItems = useMemo(() =>
    sortByDateDesc(filterByEvent(pressItems, selectedFilter)),
    [pressItems, selectedFilter]
  );

  return (
    <PageLayout
      title={t('press.page_title')}
      description={t('press.page_desc')}
      keywords={t('press.keywords')}
      canonicalUrl="https://peaceandmusic.net/press"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((press) => (
            <div key={press.id} className="h-full">
              <PressCard press={press} />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

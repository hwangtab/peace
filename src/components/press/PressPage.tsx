import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { getPressItems } from '@/api/press';
import { PressItem } from '@/types/press';
import { getBreadcrumbSchema } from '@/utils/structuredData';
import Button from '@/components/common/Button';
import { getCamps } from '@/data/camps';
import { filterByEvent } from '@/utils/filtering';
import { sortByDateDesc } from '@/utils/sorting';
import EventFilter from '../common/EventFilter';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '../common/PageHero';

interface PressPageProps {
  initialPressItems?: PressItem[];
  initialLocale?: string;
}

const normalizePressItems = (items: PressItem[]): PressItem[] =>
  items.map((item) => ({
    ...item,
    eventType: item.eventType ?? 'album',
    eventYear: item.eventYear ?? 2024,
  }));

const PressCard: React.FC<{ press: PressItem }> = ({ press }) => {
  const [imgSrc, setImgSrc] = useState(press.imageUrl || '');

  return (
    <a
      href={press.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full cursor-pointer"
    >
      <article className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col">
        {imgSrc && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={imgSrc}
              alt={press.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-110"
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
          <h3 className="typo-h3 hover:text-jeju-ocean transition-colors duration-200 text-balance break-words">
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
  const camp2026 = getCamps(i18n.language).find(c => c.id === 'camp-2026');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [pressItems, setPressItems] = useState<PressItem[]>(normalizePressItems(initialPressItems));

  useEffect(() => {
    if (i18n.language === initialLocale) {
      setPressItems(normalizePressItems(initialPressItems));
      return;
    }

    let isCancelled = false;

    const loadPress = async () => {
      const data = await getPressItems(i18n.language);
      if (!isCancelled) {
        setPressItems(normalizePressItems(data));
      }
    };

    loadPress();

    return () => {
      isCancelled = true;
    };
  }, [i18n.language, initialLocale, initialPressItems]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((press) => (
            <div key={press.id} className="h-full">
              <PressCard press={press} />
            </div>
          ))}
        </div>

        {/* Camp 2026 CTA */}
        {camp2026?.fundingUrl && (
          <div className="mt-16 bg-jeju-ocean rounded-xl py-8 px-6 text-center">
            <p className="text-white text-lg font-medium mb-4 break-words">{t('camp.title_2026')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button to="/camps/2026" variant="ghost-white" size="sm">
                {t('camp.view_detail')}
              </Button>
              <Button href={camp2026.fundingUrl} variant="gold" size="sm" external utmContent="press">
                {t('camp.ticketing_2026')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

import React, { useRef, useState, useMemo } from 'react';
import { useInView } from 'framer-motion';
import { PressItem, pressItems } from '../../data/press';
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const breadcrumbs = [
    { name: "홈", url: "https://peaceandmusic.net/" },
    { name: "언론보도", url: "https://peaceandmusic.net/press" }
  ];

  const structuredData = [
    getBreadcrumbSchema(breadcrumbs)
  ];

  const filteredItems = useMemo(() =>
    sortByDateDesc(filterByEvent(pressItems, selectedFilter)),
    [selectedFilter]
  );

  return (
    <PageLayout
      title="언론보도 | 이름을 모르는 먼 곳의 그대에게"
      description="평화를 노래하는 우리들의 이야기. 이름을 모르는 먼 곳의 그대에게 프로젝트에 대한 언론 보도와 기사를 확인하세요."
      keywords="언론보도, 기사, 뉴스, 평화 프로젝트 보도"
      canonicalUrl="https://peaceandmusic.net/press"
      structuredData={structuredData}
      background="ocean-sand"
      disableTopPadding={true}
    >
      <PageHero
        title="언론보도"
        subtitle="평화를 노래하는 우리들의 이야기"
        backgroundImage="/images-webp/camps/2023/DSC00610.webp"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12" ref={ref}>
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

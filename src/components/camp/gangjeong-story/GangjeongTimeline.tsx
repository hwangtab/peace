import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface TimelineNode {
  year: string;
  titleKey: string;
  descKey: string;
  color: string;
  badge?: string;
}

const nodes: TimelineNode[] = [
  { year: '2007', titleKey: 'gangjeong_story.timeline_2007_title', descKey: 'gangjeong_story.timeline_2007_desc', color: 'bg-sunset-coral' },
  { year: '2009', titleKey: 'gangjeong_story.timeline_2009_title', descKey: 'gangjeong_story.timeline_2009_desc', color: 'bg-sunset-coral' },
  { year: '2012', titleKey: 'gangjeong_story.timeline_2012_title', descKey: 'gangjeong_story.timeline_2012_desc', color: 'bg-sunset-coral' },
  { year: '2015', titleKey: 'gangjeong_story.timeline_2015_title', descKey: 'gangjeong_story.timeline_2015_desc', color: 'bg-golden-sun' },
  { year: '2016', titleKey: 'gangjeong_story.timeline_2016_title', descKey: 'gangjeong_story.timeline_2016_desc', color: 'bg-coastal-gray' },
  { year: '2018', titleKey: 'gangjeong_story.timeline_2018_title', descKey: 'gangjeong_story.timeline_2018_desc', color: 'bg-golden-sun' },
  { year: '2023', titleKey: 'gangjeong_story.timeline_2023_title', descKey: 'gangjeong_story.timeline_2023_desc', color: 'bg-jeju-ocean' },
  { year: '2024', titleKey: 'gangjeong_story.timeline_2024_title', descKey: 'gangjeong_story.timeline_2024_desc', color: 'bg-golden-sun' },
  { year: '2025', titleKey: 'gangjeong_story.timeline_2025_title', descKey: 'gangjeong_story.timeline_2025_desc', color: 'bg-sunset-coral' },
  { year: '2026', titleKey: 'gangjeong_story.timeline_2026_title', descKey: 'gangjeong_story.timeline_2026_desc', color: 'bg-golden-sun', badge: 'gangjeong_story.timeline_2026_badge' },
];

const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

interface Props {
  variant?: 'camp' | 'home';
}

const GangjeongTimeline: React.FC<Props> = ({ variant = 'camp' }) => {
  const { t } = useTranslation();
  const isHome = variant === 'home';
  const lineGradient = isHome
    ? 'from-ocean-mist/40 via-jeju-ocean/40 to-seafoam/40'
    : 'from-sunset-coral/40 via-jeju-ocean/40 to-golden-sun/40';

  return (
    <div className={`${isHome ? 'bg-sky-horizon' : 'bg-white'} py-16 sm:py-20 md:py-28`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className={`typo-h2 text-center ${isHome ? 'text-jeju-ocean' : 'text-gray-900'} mb-12 sm:mb-16`}
        >
          {t('gangjeong_story.timeline_title')}
        </motion.h3>

        <ol className="relative max-w-3xl mx-auto">
          {/* Vertical center line — desktop only */}
          <div className={`hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b ${lineGradient}`} />
          {/* Vertical left line — mobile only */}
          <div className={`md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b ${lineGradient}`} />

          {nodes.map((node, i) => {
            const isLeft = i % 2 === 0;
            const isLast = i === nodes.length - 1;

            return (
              <motion.li
                key={node.year}
                variants={nodeVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="relative mb-8 md:mb-12 last:mb-0"
              >
                {/* Mobile layout */}
                <div className="md:hidden flex items-start pl-10">
                  {/* Dot */}
                  <div className={`absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full ${node.color} border-2 border-white shadow-sm ${isLast ? 'ring-4 ring-golden-sun/30 motion-safe:animate-pulse' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 ${node.color} text-white text-xs font-bold rounded-full`}>
                        {node.year}
                      </span>
                      {node.badge && (
                        <span className="inline-block px-2 py-0.5 bg-golden-sun text-deep-ocean text-xs font-bold rounded-full">
                          {t(node.badge)}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 break-words">{t(node.titleKey)}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 break-words">{t(node.descKey)}</p>
                  </div>
                </div>

                {/* Desktop layout — alternating left/right */}
                <div className="hidden md:flex items-center">
                  {/* Left content */}
                  <div className={`w-5/12 pr-8 ${isLeft ? 'text-right' : ''}`}>
                    {isLeft && (
                      <div>
                        <div className="flex items-center justify-end gap-2 mb-1 flex-wrap">
                          {node.badge && (
                            <span className="inline-block px-2.5 py-0.5 bg-golden-sun text-deep-ocean text-xs font-bold rounded-full">
                              {t(node.badge)}
                            </span>
                          )}
                          <span className={`inline-block px-2.5 py-0.5 ${node.color} text-white text-xs font-bold rounded-full`}>
                            {node.year}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 break-words">{t(node.titleKey)}</h4>
                        <p className="text-sm text-gray-500 mt-0.5 break-words">{t(node.descKey)}</p>
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div className="w-2/12 flex justify-center relative">
                    <div className={`w-4 h-4 rounded-full ${node.color} border-2 border-white shadow-md z-10 ${isLast ? 'ring-4 ring-golden-sun/30 motion-safe:animate-pulse' : ''}`} />
                  </div>

                  {/* Right content */}
                  <div className={`w-5/12 pl-8 ${!isLeft ? 'text-left' : ''}`}>
                    {!isLeft && (
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-block px-2.5 py-0.5 ${node.color} text-white text-xs font-bold rounded-full`}>
                            {node.year}
                          </span>
                          {node.badge && (
                            <span className="inline-block px-2.5 py-0.5 bg-golden-sun text-deep-ocean text-xs font-bold rounded-full">
                              {t(node.badge)}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-gray-900 break-words">{t(node.titleKey)}</h4>
                        <p className="text-sm text-gray-500 mt-0.5 break-words">{t(node.descKey)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default GangjeongTimeline;

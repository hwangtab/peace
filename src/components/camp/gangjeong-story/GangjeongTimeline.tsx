import React from 'react';
import { m as motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';

interface TimelineNode {
  year: string;
  titleKey: string;
  descKey: string;
  color: string;
  badge?: string;
  href?: string;
}

const nodes: TimelineNode[] = [
  {
    year: '2007',
    titleKey: 'timeline_2007_title',
    descKey: 'timeline_2007_desc',
    color: 'bg-sunset-coral',
  },
  {
    year: '2009',
    titleKey: 'timeline_2009_title',
    descKey: 'timeline_2009_desc',
    color: 'bg-sunset-coral',
  },
  {
    year: '2012',
    titleKey: 'timeline_2012_title',
    descKey: 'timeline_2012_desc',
    color: 'bg-sunset-coral',
  },
  {
    year: '2015',
    titleKey: 'timeline_2015_title',
    descKey: 'timeline_2015_desc',
    color: 'bg-golden-sun',
  },
  {
    year: '2016',
    titleKey: 'timeline_2016_title',
    descKey: 'timeline_2016_desc',
    color: 'bg-coastal-gray',
  },
  {
    year: '2018',
    titleKey: 'timeline_2018_title',
    descKey: 'timeline_2018_desc',
    color: 'bg-sunset-coral',
  },
  {
    year: '2023',
    titleKey: 'timeline_2023_title',
    descKey: 'timeline_2023_desc',
    color: 'bg-jeju-ocean',
    href: '/camps/2023',
  },
  {
    year: '2024',
    titleKey: 'timeline_2024_title',
    descKey: 'timeline_2024_desc',
    color: 'bg-golden-sun',
  },
  {
    year: '2025',
    titleKey: 'timeline_2025_title',
    descKey: 'timeline_2025_desc',
    color: 'bg-sunset-coral',
  },
  {
    year: '2025',
    titleKey: 'timeline_2025b_title',
    descKey: 'timeline_2025b_desc',
    color: 'bg-jeju-ocean',
    href: '/camps/2025',
  },
  {
    year: '2026',
    titleKey: 'timeline_2026_title',
    descKey: 'timeline_2026_desc',
    color: 'bg-golden-sun',
    badge: 'timeline_2026_badge',
    href: '/camps/2026',
  },
];

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const nodeVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

interface Props {
  variant?: 'camp' | 'home';
}

const GangjeongTimeline: React.FC<Props> = ({ variant = 'camp' }) => {
  const { t } = useTranslation('gangjeong');
  const isHome = variant === 'home';
  const lineGradient = isHome
    ? 'from-ocean-mist/40 via-jeju-ocean/40 to-seafoam/40'
    : 'from-sunset-coral/40 via-jeju-ocean/40 to-golden-sun/40';

  return (
    <Section background={isHome ? 'sky-horizon' : 'white'} paddingTop="loose" paddingBottom="loose">
      <Container size="prose">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className={`typo-h2 text-center ${isHome ? 'text-jeju-ocean' : 'text-deep-ocean'} mb-12 md:mb-16`}
        >
          {t('timeline_title')}
        </motion.h3>

        <div className="relative">
          {/* Vertical center line — desktop only. ol 외부로 빼서 a11y(ol 자식은 li만) 준수 */}
          <div
            aria-hidden="true"
            className={`hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b ${lineGradient}`}
          />
          {/* Vertical left line — mobile only */}
          <div
            aria-hidden="true"
            className={`md:hidden absolute start-4 top-0 bottom-0 w-0.5 bg-gradient-to-b ${lineGradient}`}
          />

          <motion.ol
            className="relative"
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {nodes.map((node, i) => {
              const isLeft = i % 2 === 0;
              const isLast = i === nodes.length - 1;

              return (
                <motion.li
                  key={node.titleKey}
                  variants={nodeVariants}
                  className="relative mb-8 md:mb-12 last:mb-0"
                >
                  {/* Mobile layout */}
                  <div className="md:hidden flex items-start ps-10">
                    {/* Dot */}
                    <div
                      className={`absolute start-2.5 top-1.5 w-3.5 h-3.5 rounded-full ${node.color} border-2 border-white shadow-sm ${isLast ? 'ring-4 ring-golden-sun/30 motion-safe:animate-pulse' : ''}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`inline-block px-3 py-1 ${node.color} text-white text-xs font-bold rounded-full`}
                        >
                          {node.year}
                        </span>
                        {node.badge && (
                          <span className="inline-block px-3 py-1 bg-golden-sun text-deep-ocean text-xs font-bold rounded-full">
                            {t(node.badge)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-deep-ocean break-words">
                        {node.href ? (
                          <Link
                            href={node.href}
                            className="hover:text-jeju-ocean transition-colors"
                          >
                            {t(node.titleKey)}
                          </Link>
                        ) : (
                          t(node.titleKey)
                        )}
                      </h4>
                      <p className="text-xs text-coastal-gray mt-0.5 break-words">
                        {t(node.descKey)}
                      </p>
                    </div>
                  </div>

                  {/* Desktop layout — alternating left/right */}
                  <div className="hidden md:flex items-center">
                    {/* Left content */}
                    <div className={`w-5/12 pe-8 ${isLeft ? 'text-end' : ''}`}>
                      {isLeft && (
                        <div>
                          <div className="flex items-center justify-end gap-2 mb-1 flex-wrap">
                            {node.badge && (
                              <span className="inline-block px-3 py-1 bg-golden-sun text-deep-ocean text-xs font-bold rounded-full">
                                {t(node.badge)}
                              </span>
                            )}
                            <span
                              className={`inline-block px-3 py-1 ${node.color} text-white text-xs font-bold rounded-full`}
                            >
                              {node.year}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-deep-ocean break-words">
                            {node.href ? (
                              <Link
                                href={node.href}
                                className="hover:text-jeju-ocean transition-colors"
                              >
                                {t(node.titleKey)}
                              </Link>
                            ) : (
                              t(node.titleKey)
                            )}
                          </h4>
                          <p className="text-sm text-coastal-gray mt-0.5 break-words">
                            {t(node.descKey)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center dot */}
                    <div className="w-2/12 flex justify-center relative">
                      <div
                        className={`w-4 h-4 rounded-full ${node.color} border-2 border-white shadow-md z-10 ${isLast ? 'ring-4 ring-golden-sun/30 motion-safe:animate-pulse' : ''}`}
                      />
                    </div>

                    {/* Right content */}
                    <div className={`w-5/12 ps-8 ${!isLeft ? 'text-start' : ''}`}>
                      {!isLeft && (
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`inline-block px-3 py-1 ${node.color} text-white text-xs font-bold rounded-full`}
                            >
                              {node.year}
                            </span>
                            {node.badge && (
                              <span className="inline-block px-3 py-1 bg-golden-sun text-deep-ocean text-xs font-bold rounded-full">
                                {t(node.badge)}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-deep-ocean break-words">
                            {node.href ? (
                              <Link
                                href={node.href}
                                className="hover:text-jeju-ocean transition-colors"
                              >
                                {t(node.titleKey)}
                              </Link>
                            ) : (
                              t(node.titleKey)
                            )}
                          </h4>
                          <p className="text-sm text-coastal-gray mt-0.5 break-words">
                            {t(node.descKey)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>
        </div>
      </Container>
    </Section>
  );
};

export default GangjeongTimeline;

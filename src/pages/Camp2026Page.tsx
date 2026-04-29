import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCamp } from '@/hooks/useCamps';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import SectionWave from '@/components/layout/SectionWave';
import { CampTimetable } from '@/components/camp/timetable';
import { timetable2026 } from '@/data/timetable-2026';
import CampHero from '@/components/camp/CampHero';
import dynamic from 'next/dynamic';

const GangjeongStorySection = dynamic(() => import('@/components/camp/GangjeongStorySection'));
import { getEventSchema, getBreadcrumbSchema, getHowToSchema, getWebPageSchema, getFAQSchema, getItemListSchema, getEventSeriesSchema } from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { buildUtmUrl } from '@/utils/utm';
import Button from '@/components/common/Button';
import { formatOrdinal } from '@/utils/format';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface CampPageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const Camp2026Page: React.FC<CampPageProps> = ({ initialMusicians = [], initialLocale = 'ko' }) => {
  const { t, i18n } = useTranslation();
  const camp2026 = useCamp('camp-2026');
  const ordinalLabel = formatOrdinal(3, i18n.language);
  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = useMemo(
    () => (musiciansResource.isLoading ? [] : musiciansResource.data),
    [musiciansResource.isLoading, musiciansResource.data],
  );

  const breadcrumbs = useMemo(() => [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: `${t('nav.camp')} 2026`, url: getFullUrl('/camps/2026') },
  ], [t]);

  const structuredData = useMemo(() => {
    if (!camp2026) return [];

    const translatedTitle = t('camp.title_2026');
    const translatedDescription = t('camp.description_2026');

    const subEvents = timetable2026.days.flatMap((day) =>
      day.acts
        .filter((a) => a.type === 'performance')
        .map((a) => {
          const musician = a.musicianIds && a.musicianIds.length === 1
            ? musicians.find((m) => m.id === a.musicianIds![0])
            : undefined;
          const actId = `https://peaceandmusic.net/camps/2026#act-${day.date}-${a.order}`;
          return {
            id: actId,
            url: actId,
            name: a.name,
            startDate: `${day.date}T${a.start}:00+09:00`,
            endDate: `${day.date}T${a.end}:00+09:00`,
            performerName: a.name,
            performerUrl:
              a.musicianIds && a.musicianIds.length === 1
                ? getFullUrl(`/camps/2026/musicians/${a.musicianIds[0]}`)
                : undefined,
            performerSameAs: musician?.instagramUrls?.length ? musician.instagramUrls : undefined,
            image: musician?.imageUrl ? getFullUrl(musician.imageUrl) : undefined,
          };
        })
    );

    let actPosition = 0;
    const timetableItems = timetable2026.days.flatMap((day) =>
      day.acts
        .filter((a) => a.type === 'performance')
        .map((a) => {
          actPosition += 1;
          const musician = a.musicianIds && a.musicianIds.length === 1
            ? musicians.find((m) => m.id === a.musicianIds![0])
            : undefined;
          return {
            position: actPosition,
            name: a.name,
            url: `https://peaceandmusic.net/camps/2026#act-${day.date}-${a.order}`,
            image: musician?.imageUrl ? getFullUrl(musician.imageUrl) : undefined,
            startDate: `${day.date}T${a.start}:00+09:00`,
          };
        })
    );

    const itemListSchema = getItemListSchema({
      name: t('timetable.title'),
      description: translatedDescription,
      url: getFullUrl('/camps/2026#lineup'),
      items: timetableItems,
    });

    const campFaqs = [
      { question: t('camp_faq_2026.q1'), answer: t('camp_faq_2026.a1') },
      { question: t('camp_faq_2026.q2'), answer: t('camp_faq_2026.a2') },
      { question: t('camp_faq_2026.q3'), answer: t('camp_faq_2026.a3') },
      { question: t('camp_faq_2026.q4'), answer: t('camp_faq_2026.a4') },
      { question: t('camp_faq_2026.q5'), answer: t('camp_faq_2026.a5') },
      { question: t('camp_faq_2026.q6'), answer: t('camp_faq_2026.a6') },
    ];
    const faqSchema = getFAQSchema(campFaqs);

    const eventSchema = getEventSchema(
      {
        name: translatedTitle,
        alternateName: ['GPMC3', 'Gangjeong Peace and Music Camp 3'],
        startDate: camp2026.startDate,
        endDate: camp2026.endDate || camp2026.startDate,
        description: translatedDescription,
        location: {
          name: t('camp.venue_2026'),
          address: t('camp.venue_2026'),
        },
        image:
          camp2026.images && camp2026.images.length > 0 && camp2026.images[0]
            ? getFullUrl(camp2026.images[0])
            : undefined,
        images: camp2026.images?.map((img) => getFullUrl(img)),
        previousEvent: [
          {
            "@id": "https://peaceandmusic.net/camps/2023#event",
            name: t('timeline.events.camp_2023.title'),
            startDate: '2023-06-10',
          },
          {
            "@id": "https://peaceandmusic.net/camps/2025#event",
            name: t('timeline.events.camp_2025.title'),
            startDate: '2025-06-14',
          },
        ],
        isFamilyFriendly: true,
        typicalAgeRange: '0-',
        isAccessibleForFree: false,
        performers: camp2026.participants?.map((p) => {
          const musicianId = typeof p === 'object' ? p.musicianId : undefined;
          return {
            type: 'MusicGroup' as const,
            name: typeof p === 'string' ? p : p.name,
            ...(musicianId ? { url: getFullUrl(`/camps/2026/musicians/${musicianId}`) } : {}),
          };
        }),
        ...(camp2026.fundingUrl
          ? {
              offers: {
                url: camp2026.fundingUrl,
                price: '30000',
                priceCurrency: 'KRW',
                availability: 'https://schema.org/InStock',
                validFrom: '2026-01-01T00:00:00+09:00',
                validThrough: '2026-06-07T23:59:59+09:00',
              },
            }
          : {}),
        url: getFullUrl('/camps/2026'),
        id: 'https://peaceandmusic.net/camps/2026#event',
        superEventId: 'https://peaceandmusic.net/#event-series',
        subEvents,
      },
      i18n.language,
      t
    );

    const eventSeriesSchema = getEventSeriesSchema(
      {
        name: t('app.title'),
        description: t('seo.default.description'),
        url: getFullUrl('/'),
        events: [
          {
            "@id": 'https://peaceandmusic.net/camps/2023#event',
            name: t('timeline.events.camp_2023.title'),
            startDate: '2023-06-10',
            endDate: '2023-06-10',
            url: getFullUrl('/camps/2023'),
            description: t('timeline.events.camp_2023.desc'),
            image: getFullUrl('/images-webp/camps/2023/IMG_2465.webp'),
            locationName: t('timeline.events.camp_2023.location'),
            eventStatus: 'https://schema.org/EventCompleted',
            offers: {
              url: getFullUrl('/camps/2023'),
              price: '0',
              priceCurrency: 'KRW',
              availability: 'https://schema.org/SoldOut',
            },
          },
          {
            "@id": 'https://peaceandmusic.net/camps/2025#event',
            name: t('timeline.events.camp_2025.title'),
            startDate: '2025-06-14',
            endDate: '2025-06-14',
            url: getFullUrl('/camps/2025'),
            description: t('timeline.events.camp_2025.desc'),
            image: getFullUrl('/images-webp/camps/2025/peacemusic-1.webp'),
            locationName: t('timeline.events.camp_2025.location'),
            eventStatus: 'https://schema.org/EventCompleted',
            offers: {
              url: getFullUrl('/camps/2025'),
              price: '0',
              priceCurrency: 'KRW',
              availability: 'https://schema.org/SoldOut',
            },
          },
          {
            "@id": 'https://peaceandmusic.net/camps/2026#event',
            name: translatedTitle,
            startDate: camp2026.startDate,
            endDate: camp2026.endDate || camp2026.startDate,
            url: getFullUrl('/camps/2026'),
            description: translatedDescription,
            image: getFullUrl('/images-webp/camps/2026/2026poster1.webp'),
            locationName: t('camp.venue_2026'),
            eventStatus: 'https://schema.org/EventScheduled',
            ...(camp2026.fundingUrl
              ? {
                  offers: {
                    url: camp2026.fundingUrl,
                    price: '30000',
                    priceCurrency: 'KRW',
                    availability: 'https://schema.org/InStock',
                    validFrom: '2026-01-01T00:00:00+09:00',
                    validThrough: '2026-06-07T23:59:59+09:00',
                  },
                }
              : {}),
          },
        ],
      },
      t
    );

    return [
      eventSchema,
      eventSeriesSchema,
      getBreadcrumbSchema(breadcrumbs),
      getHowToSchema(i18n.language, t),
      getWebPageSchema({
        name: `${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (2026)`,
        description: translatedDescription,
        url: getFullUrl('/camps/2026'),
        datePublished: '2026-01-15',
        dateModified: new Date().toISOString().slice(0, 10),
        mainEntityId: 'https://peaceandmusic.net/camps/2026#event',
        primaryImageUrl: getFullUrl('/images-webp/camps/2026/2026poster1.webp'),
        keywords: [
          '강정피스앤뮤직캠프',
          'Gangjeong Peace Music Camp',
          '평화음악제',
          '제주 음악 페스티벌',
          '2026 캠프',
          '인디 음악',
          '강정마을',
          'peace music festival',
          'Jeju festival 2026',
        ],
      }),
      faqSchema,
      itemListSchema,
    ];
  }, [camp2026, musicians, breadcrumbs, i18n.language, t, ordinalLabel]);

  if (!camp2026) {
    return (
      <PageLayout
        title={t('camp.ordinal', { num: ordinalLabel }) + ' ' + t('app.title') + ' (2026)'}
        description={t('camp.not_found_desc')}
      >
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <h1 className="typo-h2 text-gray-900 mb-4">{t('camp.not_found')}</h1>
          </div>
        </div>
      </PageLayout>
    );
  }

  const translatedTitle = t('camp.title_2026');
  const translatedDescription = t('camp.description_2026');
  const seoTitle = t('camp.seo_title_2026');
  const seoDescription = t('camp.seo_description_2026');
  const participantCount = camp2026.participants?.length || 0;

  return (
    <PageLayout
      title={seoTitle}
      description={seoDescription}
      ogImage={camp2026?.images?.[0] || '/images-webp/camps/2023/IMG_2064.webp'}
      ogImageAlt={translatedTitle}
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      ogType="event"
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <CampHero
        camp={camp2026}
        featured
        dateBadge={t('camp.date_badge_2026')}
        dateDisplay={t('camp.date_2026')}
      >
        <Button href="#lineup" variant="gold" size="sm">
          {t('camp.lineup_count', { count: participantCount })}
        </Button>
        {camp2026.fundingUrl && (
          <Button
            href={camp2026.fundingUrl}
            variant="white"
            size="sm"
            external
            utmContent="hero"
          >
            {t('camp.ticketing_2026')}
          </Button>
        )}
      </CampHero>

      {/* Overview Section */}
      <Section background="ocean-sand" paddingBottom="loose">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-stretch min-w-0">
              {/* Poster */}
              {camp2026.fundingUrl ? (
                <a
                  href={buildUtmUrl(camp2026.fundingUrl, 'poster')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-[360px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Image
                    src="/images-webp/camps/2026/2026poster1.webp"
                    alt={translatedTitle}
                    width={360}
                    height={509}
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="w-full h-auto"
                  />
                </a>
              ) : (
                <div className="w-full md:w-[360px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images-webp/camps/2026/2026poster1.webp"
                    alt={translatedTitle}
                    width={360}
                    height={509}
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="w-full h-auto"
                  />
                </div>
              )}
              {/* Info */}
              <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
                <SectionHeader title={t('camp.section_overview')} align="left" className="!mb-6" />
                <p className="typo-body mb-6 break-words">{translatedDescription}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-sky-horizon/60 border border-seafoam/40 rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {t('camp.label_period')}
                    </p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">
                      {t('camp.date_badge_2026')}
                    </p>
                  </div>
                  <div className="bg-sky-horizon/60 border border-seafoam/40 rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {t('camp.label_location')}
                    </p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">
                      {t('camp.venue_2026')}
                    </p>
                  </div>
                  <div className="bg-sky-horizon/60 border border-seafoam/40 rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {t('camp.label_participants')}
                    </p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">
                      {t('camp.participant_count', { count: participantCount })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      <SectionWave color="ocean-sand" />

      {/* Lineup / Timetable Section */}
      {camp2026.participants && camp2026.participants.length > 0 && (
        <Section
          background="sky-horizon"
          id="lineup"
          paddingTop="loose"
          paddingBottom="loose"
        >
          <div className="container mx-auto px-4">
            <SectionHeader
              title={t('camp.section_musicians')}
              subtitle={t('camp.lineup_count', { count: participantCount })}
            />
            <div className="max-w-5xl mx-auto">
              {musiciansResource.isLoading ? (
                <p className="text-center text-gray-500 py-10" role="status">
                  {t('common.loading')}
                </p>
              ) : musiciansResource.error ? (
                <p className="text-center text-gray-500 py-10" role="alert">
                  {t('common.no_results')}
                </p>
              ) : (
                <CampTimetable
                  data={timetable2026}
                  musicians={musicians}
                  campYear={2026}
                />
              )}
            </div>
          </div>
        </Section>
      )}

      <SectionWave color="sky-horizon" />

      {/* Gangjeong Story Section */}
      <GangjeongStorySection />

      {/* Final CTA Section */}
      {camp2026.fundingUrl && (
        <>
          <section
            className="relative py-20 md:py-28 bg-cover bg-center bg-deep-ocean"
            style={{ backgroundImage: "url('/images-webp/camps/2023/20230610밤 전쟁을끝내자.webp')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" aria-hidden="true" />
            <div className="container mx-auto px-4 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="typo-h2 text-white mb-4">{t('camp.cta_final_heading')}</h2>
                <p className="typo-body text-gray-200 mb-8 max-w-lg mx-auto">
                  {t('camp.cta_final_body')}
                </p>
                <Button href={camp2026.fundingUrl} variant="gold" external utmContent="final-cta">
                  {t('camp.cta_final_button')}
                </Button>
              </motion.div>
            </div>
          </section>
        </>
      )}
    </PageLayout>
  );
};

export default Camp2026Page;

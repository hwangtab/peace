/**
 * Camp 2026 페이지의 8개 JSON-LD schema 를 한 번에 빌드한다.
 *
 * - 클라이언트 useMemo 에서 매 hydration 시 51 musicians × 2 flatMap + 8 schema
 *   직렬화 (~80–150ms long task on mobile) 을 수행하던 비용을 빌드 타임으로 이동.
 * - 서버측에서는 `loadServerTranslation` 의 결과 t 함수를, 클라이언트(폴백)에서는
 *   react-i18next 의 t 를 그대로 받는다 — 동일 시그너처 `(key, vars?) => string`.
 *
 * 결과는 `unknown[]` (각 항목이 schema 객체) — 호출자가 JSON.stringify + `<` 이스케이프.
 */

import { CampEvent, isParticipantObject } from '@/types/camp';
import { Musician } from '@/types/musician';
import { timetable2026 } from '@/data/timetable-2026';
import { getFullUrl } from '@/config/env';
import {
  getEventSchema,
  getBreadcrumbSchema,
  getHowToSchema,
  getWebPageSchema,
  getFAQSchema,
  getItemListSchema,
  getEventSeriesSchema,
} from '@/utils/structuredData';

export type SchemaT = (key: string, vars?: Record<string, string | number>) => string;

interface BuildArgs {
  t: SchemaT;
  lang: string;
  camp: CampEvent;
  musicians: Musician[];
  ordinalLabel: string;
  /** 빌드 시점 또는 호출 시점 ISO date — 사용자 트래픽마다 변하지 않게 caller 가 결정 */
  dateModifiedIso?: string;
  /** 행사 종료 여부 — true 면 EventCompleted + 판매 offers 제거 */
  isPast?: boolean;
}

export function buildCamp2026Schemas({
  t,
  lang,
  camp,
  musicians,
  ordinalLabel,
  dateModifiedIso,
  isPast = false,
}: BuildArgs): unknown[] {
  const translatedTitle = t('camp.title_2026');
  const translatedDescription = t('camp.description_2026');

  const subEvents: {
    id: string;
    url: string;
    name: string;
    startDate: string;
    endDate: string;
    performerName: string;
    performerUrl: string | undefined;
    performerSameAs: string[] | undefined;
    image: string | undefined;
  }[] = [];
  const timetableItems: {
    position: number;
    name: string;
    url: string;
    image: string | undefined;
    startDate: string;
  }[] = [];
  let actPosition = 0;
  for (const day of timetable2026.days) {
    for (const a of day.acts) {
      if (a.type !== 'performance') continue;
      const musician =
        a.musicianIds && a.musicianIds.length === 1
          ? musicians.find((m) => m.id === a.musicianIds![0])
          : undefined;
      const actId = getFullUrl(`/camps/2026#act-${day.date}-${a.order}`);
      const image = musician?.imageUrl ? getFullUrl(musician.imageUrl) : undefined;
      actPosition += 1;
      subEvents.push({
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
        image,
      });
      timetableItems.push({
        position: actPosition,
        name: a.name,
        url: actId,
        image,
        startDate: `${day.date}T${a.start}:00+09:00`,
      });
    }
  }

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

  const breadcrumbs = [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: `${t('nav.camp')} 2026`, url: getFullUrl('/camps/2026') },
  ];

  const eventSchema = getEventSchema(
    {
      name: translatedTitle,
      alternateName: [
        'GPMC3',
        'Gangjeong Peace and Music Camp 3',
        'Jeju Peace Music Festival 2026',
        '제주 평화 음악 페스티벌',
      ],
      startDate: camp.startDate,
      endDate: camp.endDate || camp.startDate,
      description: translatedDescription,
      location: {
        name: t('camp.venue_2026'),
        address: t('camp.venue_2026'),
      },
      image:
        camp.images && camp.images.length > 0 && camp.images[0]
          ? getFullUrl(camp.images[0])
          : undefined,
      images: camp.images?.map((img) => getFullUrl(img)),
      previousEvent: [
        {
          '@id': getFullUrl('/camps/2023#event'),
          name: t('timeline.events.camp_2023.title'),
          startDate: '2023-06-10',
        },
        {
          '@id': getFullUrl('/camps/2025#event'),
          name: t('timeline.events.camp_2025.title'),
          startDate: '2025-06-14',
        },
      ],
      isFamilyFriendly: true,
      typicalAgeRange: '0-',
      isAccessibleForFree: false,
      performers: camp.participants?.map((p) => {
        const participant = isParticipantObject(p) ? p : undefined;
        return {
          type: 'MusicGroup' as const,
          name: participant ? participant.name : (p as string),
          ...(participant?.musicianId
            ? { url: getFullUrl(`/camps/2026/musicians/${participant.musicianId}`) }
            : {}),
        };
      }),
      eventStatus: isPast
        ? 'https://schema.org/EventCompleted'
        : 'https://schema.org/EventScheduled',
      ...(camp.fundingUrl && !isPast
        ? {
            offers: {
              url: camp.fundingUrl,
              price: '30000',
              priceCurrency: 'KRW',
              availability: 'https://schema.org/InStock',
              validFrom: '2026-01-01T00:00:00+09:00',
              validThrough: `${camp.endDate || camp.startDate}T23:59:59+09:00`,
            },
          }
        : {}),
      url: getFullUrl('/camps/2026'),
      id: getFullUrl('/camps/2026#event'),
      superEventId: getFullUrl('/#event-series'),
      subEvents,
    },
    lang,
    t
  );

  const eventSeriesSchema = getEventSeriesSchema(
    {
      name: t('app.title'),
      description: t('seo.default.description'),
      url: getFullUrl('/'),
      events: [
        {
          '@id': getFullUrl('/camps/2023#event'),
          name: t('timeline.events.camp_2023.title'),
          alternateName: [
            'GPMC1',
            'Gangjeong Peace and Music Camp 1',
            '1st Gangjeong Peace and Music Camp',
            '제1회 강정피스앤뮤직캠프',
          ],
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
          '@id': getFullUrl('/camps/2025#event'),
          name: t('timeline.events.camp_2025.title'),
          alternateName: [
            'GPMC2',
            'Gangjeong Peace and Music Camp 2',
            '2nd Gangjeong Peace and Music Camp',
            '제2회 강정피스앤뮤직캠프',
          ],
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
          '@id': getFullUrl('/camps/2026#event'),
          name: translatedTitle,
          alternateName: [
            'GPMC3',
            'Gangjeong Peace and Music Camp 3',
            '3rd Gangjeong Peace and Music Camp',
            'Jeju Peace Music Festival 2026',
            '제3회 강정피스앤뮤직캠프',
            '제주 평화 음악 페스티벌',
          ],
          startDate: camp.startDate,
          endDate: camp.endDate || camp.startDate,
          url: getFullUrl('/camps/2026'),
          description: translatedDescription,
          image: getFullUrl('/images-webp/camps/2026/2026poster1-display.webp'),
          locationName: t('camp.venue_2026'),
          eventStatus: isPast
            ? 'https://schema.org/EventCompleted'
            : 'https://schema.org/EventScheduled',
          ...(camp.fundingUrl && !isPast
            ? {
                offers: {
                  url: camp.fundingUrl,
                  price: '30000',
                  priceCurrency: 'KRW',
                  availability: 'https://schema.org/InStock',
                  validFrom: '2026-01-01T00:00:00+09:00',
                  validThrough: `${camp.endDate || camp.startDate}T23:59:59+09:00`,
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
    getHowToSchema(lang, t),
    getWebPageSchema({
      name: `${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (2026)`,
      description: translatedDescription,
      url: getFullUrl('/camps/2026'),
      datePublished: '2026-01-15',
      dateModified: dateModifiedIso ?? '2026-05-13',
      mainEntityId: getFullUrl('/camps/2026#event'),
      primaryImageUrl: getFullUrl('/images-webp/camps/2026/2026poster1-display.webp'),
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
}

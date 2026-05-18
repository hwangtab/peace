/**
 * 2023/2025 캠프 상세 페이지의 JSON-LD schema 를 빌드한다.
 *
 * - 이전: CampDetailPage 내부 useMemo 에서 t/i18n 의존성과 함께 인라인 빌드되어
 *   단위 테스트와 SSR-시 검증이 어려웠음.
 * - 2026 (Camp2026Page) 의 buildCamp2026Schemas 와 동일한 패턴 — 동일한 SchemaT
 *   시그너처의 t 를 받아 schema 배열을 반환한다.
 *
 * 2026 분기는 빌드 대상이 아니므로 제거한다 (Camp2026Page 는 buildCamp2026Schemas 사용).
 */

import { CampEvent } from '@/types/camp';
import { getFullUrl } from '@/config/env';
import {
  getEventSchema,
  getBreadcrumbSchema,
  getWebPageSchema,
} from '@/utils/structuredData';
import type { SchemaT } from '@/utils/buildCamp2026Schemas';

interface BuildArgs {
  t: SchemaT;
  lang: string;
  camp: CampEvent;
  ordinalLabel: string;
  breadcrumbs: Array<{ name: string; url: string }>;
}

const getKeywordsForCamp = (year: number): string[] => {
  if (year === 2023) {
    return [
      '제1회 강정피스앤뮤직캠프',
      '1st Gangjeong Peace Music Camp 2023',
      '강정 평화음악제',
      'Gangjeong peace festival',
      '2023 캠프',
      'Jeju music 2023',
      '첫 번째 캠프',
      'first camp',
    ];
  } else if (year === 2025) {
    return [
      '제2회 강정피스앤뮤직캠프',
      '2nd Gangjeong Peace Music Camp 2025',
      '강정 평화음악제',
      'Gangjeong peace festival',
      '2025 캠프',
      'Jeju music 2025',
      '두 번째 캠프',
      'second camp',
    ];
  }
  return [];
};

const alternateNamesByYear: Record<number, string[]> = {
  2023: [
    'GPMC1',
    'Gangjeong Peace and Music Camp 1',
    '1st Gangjeong Peace and Music Camp',
    '제1회 강정피스앤뮤직캠프',
    'Jeju Peace Music Festival 2023',
  ],
  2025: [
    'GPMC2',
    'Gangjeong Peace and Music Camp 2',
    '2nd Gangjeong Peace and Music Camp',
    '제2회 강정피스앤뮤직캠프',
    'Jeju Peace Music Festival 2025',
  ],
};

export function buildCampDetailSchemas({
  t,
  lang,
  camp,
  ordinalLabel,
  breadcrumbs,
}: BuildArgs): unknown[] {
  const eventSchema = getEventSchema(
    {
      name: camp.title,
      ...(alternateNamesByYear[camp.year]
        ? { alternateName: alternateNamesByYear[camp.year] }
        : {}),
      startDate: camp.startDate,
      endDate: camp.endDate || camp.startDate,
      description: camp.description,
      location: {
        name: camp.location.split('(')[0]?.trim() || camp.location,
        address: camp.location.includes('(')
          ? camp.location.split('(')[1]?.replace(')', '') || camp.location
          : camp.location,
      },
      image:
        camp.images && camp.images.length > 0 && camp.images[0]
          ? getFullUrl(camp.images[0])
          : undefined,
      performers: camp.participants?.map((p) => ({
        type: 'MusicGroup',
        name: typeof p === 'string' ? p : p.name,
      })),
      eventStatus: camp.year < 2026
        ? 'https://schema.org/EventCompleted'
        : 'https://schema.org/EventScheduled',
      offers: {
        url: getFullUrl(`/camps/${camp.year}`),
        price: '0',
        priceCurrency: 'KRW',
        availability: camp.year < 2026
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      },
      url: getFullUrl(`/camps/${camp.year}`),
      id: `https://peaceandmusic.net/camps/${camp.year}#event`,
      superEventId: 'https://peaceandmusic.net/#event-series',
    },
    lang,
    t
  );

  return [
    eventSchema,
    getBreadcrumbSchema(breadcrumbs),
    getWebPageSchema({
      name: `${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (${camp.year})`,
      description: camp.description,
      url: getFullUrl(`/camps/${camp.year}`),
      datePublished: camp.startDate,
      keywords: getKeywordsForCamp(camp.year),
    }),
  ];
}

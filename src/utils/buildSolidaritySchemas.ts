import { SolidarityEvent } from '@/data/solidarity';
import { getFullUrl } from '@/config/env';

export interface SolidarityEventSchemaOptions {
  /** 유료 공연일 때의 사전 예매가(KRW). 생략하면 무료 공연으로 표기한다. */
  price?: number;
  /** 상세 페이지가 따로 있을 때의 정식 URL. 생략하면 /solidarity 목록 URL. */
  url?: string;
  /** 예매 시작일(ISO). offers.validFrom 으로 들어간다. */
  offerValidFrom?: string;
}

export function buildSolidarityEventSchema(
  event: SolidarityEvent,
  options: SolidarityEventSchemaOptions = {}
): object {
  const listUrl = getFullUrl('/solidarity');
  const pageUrl = options.url ?? listUrl;
  const isFree = options.price === undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    '@id': `${listUrl}#${event.id}`,
    name: event.title,
    startDate: event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: isFree,
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address.streetAddress,
        addressLocality: event.address.addressLocality,
        addressRegion: event.address.addressRegion,
        addressCountry: event.address.addressCountry,
      },
    },
    image: getFullUrl(event.poster),
    description: event.paragraphs[0] ?? '',
    performer: event.lineup.map((entry) => ({
      '@type': 'MusicGroup',
      name: entry.name,
    })),
    organizer: {
      '@type': 'Organization',
      name: event.organizers,
    },
    offers: {
      '@type': 'Offer',
      price: String(options.price ?? 0),
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
      ...(options.offerValidFrom ? { validFrom: options.offerValidFrom } : {}),
    },
    url: pageUrl,
  };
}

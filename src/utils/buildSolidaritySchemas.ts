import { SolidarityEvent } from '@/data/solidarity';
import { getFullUrl } from '@/config/env';

export function buildSolidarityEventSchema(event: SolidarityEvent): object {
  const pageUrl = getFullUrl('/solidarity');
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    '@id': `${pageUrl}#${event.id}`,
    name: event.title,
    startDate: event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: true,
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
      price: '0',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
    url: pageUrl,
  };
}

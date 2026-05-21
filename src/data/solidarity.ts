import { TFunction } from 'next-i18next';

export interface LineupEntry {
  name: string;
  musicianId: number | null;
}

interface SolidarityEventStruct {
  id: string;
  keyPrefix: string;
  poster: string;
  paraCount: number;
  lineup: LineupEntry[];
  organizers: string;
  contact: { name: string; url: string };
}

export interface SolidarityEvent {
  id: string;
  poster: string;
  posterAlt: string;
  title: string;
  date: string;
  venue: string;
  venueAddress: string;
  paragraphs: string[];
  note: string;
  lineup: LineupEntry[];
  organizers: string;
  contact: { name: string; url: string };
}

const eventStructs: SolidarityEventStruct[] = [
  {
    id: 'event-sail',
    keyPrefix: 'solidarity.event_sail',
    poster: '/images-webp/solidarity/we-are-sail-for-your-freedom.webp',
    paraCount: 4,
    lineup: [
      { name: '강가히말라야', musicianId: 14 },
      { name: '길가는밴드 장현호', musicianId: 15 },
      { name: '모레도토요일', musicianId: 7 },
      { name: '삼각전파사', musicianId: 34 },
      { name: '이서영', musicianId: 12 },
    ],
    organizers: '팔레스타인해방을위한항해한국본부 × 강정피스앤뮤직캠프조직위원회',
    contact: { name: '황경하', url: 'https://open.kakao.com/me/Alfseoul' },
  },
];

export function getSolidarityEvents(t: TFunction): SolidarityEvent[] {
  return eventStructs.map((s) => ({
    id: s.id,
    poster: s.poster,
    posterAlt: t(`${s.keyPrefix}.poster_alt`),
    title: t(`${s.keyPrefix}.title`),
    date: t(`${s.keyPrefix}.date`),
    venue: t(`${s.keyPrefix}.venue`),
    venueAddress: t(`${s.keyPrefix}.venue_address`),
    paragraphs: Array.from({ length: s.paraCount }, (_, i) => t(`${s.keyPrefix}.para_${i + 1}`)),
    note: t(`${s.keyPrefix}.note`),
    lineup: s.lineup,
    organizers: s.organizers,
    contact: s.contact,
  }));
}

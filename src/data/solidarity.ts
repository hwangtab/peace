import { TFunction } from 'next-i18next';

export interface LineupEntry {
  name: string;
  musicianId: number | null;
}

interface SolidarityAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
}

interface SolidarityEventStruct {
  id: string;
  keyPrefix: string;
  poster: string;
  paraCount: number;
  lineup: LineupEntry[];
  organizers: string;
  contact: { name: string; url: string };
  startDate: string;
  address: SolidarityAddress;
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
  startDate: string;
  address: SolidarityAddress;
}

const eventStructs: SolidarityEventStruct[] = [
  {
    id: 'keep-singing-for-palestine',
    keyPrefix: 'solidarity.event_ksfp',
    poster: '/images-webp/solidarity/keep-singing-for-palestine.webp',
    paraCount: 3,
    lineup: [
      { name: '이서영', musicianId: 12 },
      { name: '이형주', musicianId: null },
      { name: '모레도토요일', musicianId: 7 },
      { name: '모모', musicianId: 10 },
    ],
    organizers: '강정피스앤뮤직캠프 × 팔레스타인해방운동',
    contact: { name: '황경하', url: 'https://open.kakao.com/me/Alfseoul' },
    startDate: '2026-09-19T18:00:00+09:00',
    address: {
      streetAddress: '삼일대로17길 23 3층',
      addressLocality: '서울특별시',
      addressRegion: '종로구',
      addressCountry: 'KR',
    },
  },
  {
    id: 'we-sing-for-your-freedom',
    keyPrefix: 'solidarity.event_sail',
    poster: '/images-webp/solidarity/we-are-sail-for-your-freedom.webp',
    paraCount: 2,
    lineup: [
      { name: '강가히말라야', musicianId: 14 },
      { name: '길가는밴드 장현호', musicianId: 15 },
      { name: '모레도토요일', musicianId: 7 },
      { name: '삼각전파사', musicianId: 34 },
      { name: '이서영', musicianId: 12 },
    ],
    organizers: '팔레스타인해방을위한항해한국본부 × 강정피스앤뮤직캠프조직위원회',
    contact: { name: '황경하', url: 'https://open.kakao.com/me/Alfseoul' },
    startDate: '2026-05-23T19:00:00+09:00',
    address: {
      streetAddress: '종로 26',
      addressLocality: '서울특별시',
      addressRegion: '종로구',
      addressCountry: 'KR',
    },
  },
];

/**
 * 전용 정적 라우트(`pages/solidarity/keep-singing-for-palestine.tsx`)를 가진 slug.
 * `[slug].tsx` 의 getStaticPaths 는 이 목록을 제외해 경로 중복을 막는다.
 */
export const DEDICATED_ROUTE_SLUGS = ['keep-singing-for-palestine'];

export function getSolidarityEventSlugs(): string[] {
  return eventStructs.map((s) => s.id);
}

export function getSolidarityEventLineupIds(slug: string): number[] {
  const struct = eventStructs.find((s) => s.id === slug);
  return (struct?.lineup ?? []).map((e) => e.musicianId).filter((id): id is number => id !== null);
}

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
    startDate: s.startDate,
    address: s.address,
  }));
}

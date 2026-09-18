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
    poster: '/images-webp/solidarity/keep-singing-for-palestine-20260918.webp',
    paraCount: 3,
    lineup: [
      { name: '이서영', musicianId: 12 },
      { name: '이형주', musicianId: null },
      { name: '모모', musicianId: 10 },
      // 남수는 본래 같은 날 낮 집회의 연대 공연자였다. 행사가 통째로 거리집회가
      // 되면서 낮과 저녁의 구분이 사라져 한 라인업으로 합친다.
      { name: '남수', musicianId: 4 },
      // 2026-09-18 추가: 임정득(민중가수, '소금꽃나무').
      { name: '임정득', musicianId: 42 },
      // 모레도토요일은 반쥴 공연 포스터에는 있었지만 거리집회 출연진이 아니다
      // (2026-09-16 운영자 확인, dfb383c9). 구조화 데이터 performer 목록에도 넣지 않는다.
    ],
    organizers: '강정피스앤뮤직캠프 × 팔레스타인해방운동',
    // 2026-09-17: 확정 공지에서 문의처가 이상(010-2379-0760)으로 바뀌었다.
    contact: { name: '이상', url: 'tel:010-2379-0760' },
    // 기획 변경(2026-09-13): 반쥴 대관을 취소하고 거리 집회에 합류한다.
    // 2026-09-17에 광화문광장 17:30으로 재확정된 뒤, 같은 날 다시 경복궁역
    // 서십자각터로 장소가 바뀌었다(직전 공지 순서: 덕수궁 돌담길 14:00 → 광화문광장
    // 17:30). 이 값이 MusicEvent.location·startDate로 나가므로 비워 두면 검색
    // 결과가 장소 없는 행사를 보여준다.
    startDate: '2026-09-19T17:30:00+09:00',
    address: {
      streetAddress: '사직로 130 (경복궁역 서십자각터)',
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

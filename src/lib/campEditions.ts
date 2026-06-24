// 캠프 회차(연도 ↔ 제N회) 단일 정의. 새 회차가 생기면 여기 한 줄만 추가한다.
// (2024는 앨범이라 캠프 회차가 아님 → 제외.)
export const CAMP_EDITIONS: Record<number, number> = {
  2023: 1,
  2025: 2,
  2026: 3,
};

export const CAMP_EDITION_YEARS: number[] = Object.keys(CAMP_EDITIONS)
  .map(Number)
  .sort((a, b) => b - a);

export const campEditionLabel = (year: number | null): string => {
  if (year == null) return '회차 미지정';
  const no = CAMP_EDITIONS[year];
  return no ? `제${no}회 강정피스앤뮤직캠프 (${year})` : `${year} 캠프`;
};

export const whitepaperSlug = (year: number): string => `camp-${year}-whitepaper`;

export const parseWhitepaperYear = (slug: string): number | null => {
  const m = slug.match(/^camp-(\d{4})-whitepaper$/);
  return m ? Number(m[1]) : null;
};

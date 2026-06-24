import {
  CAMP_EDITION_YEARS,
  campEditionLabel,
  whitepaperSlug,
  parseWhitepaperYear,
} from './campEditions';

test('CAMP_EDITION_YEARS는 회차 연도를 내림차순으로 준다', () => {
  expect(CAMP_EDITION_YEARS).toEqual([2026, 2025, 2023]);
});

test('campEditionLabel은 매핑된 회차는 제N회로, 없으면 연도 폴백', () => {
  expect(campEditionLabel(2026)).toBe('제3회 강정피스앤뮤직캠프 (2026)');
  expect(campEditionLabel(2023)).toBe('제1회 강정피스앤뮤직캠프 (2023)');
  expect(campEditionLabel(2030)).toBe('2030 캠프');
  expect(campEditionLabel(null)).toBe('회차 미지정');
});

test('whitepaperSlug / parseWhitepaperYear 왕복', () => {
  expect(whitepaperSlug(2026)).toBe('camp-2026-whitepaper');
  expect(parseWhitepaperYear('camp-2026-whitepaper')).toBe(2026);
  expect(parseWhitepaperYear('camp-2025-whitepaper')).toBe(2025);
  expect(parseWhitepaperYear('other-doc')).toBeNull();
});

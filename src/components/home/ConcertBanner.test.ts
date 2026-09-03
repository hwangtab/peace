import { isConcertBannerActive } from './ConcertBanner';

describe('isConcertBannerActive', () => {
  it('공연 당일 낮에는 노출한다', () => {
    // 2026-09-19 12:00 KST
    expect(isConcertBannerActive(new Date('2026-09-19T12:00:00+09:00'))).toBe(true);
  });

  it('공연 당일 자정 직전까지 노출한다', () => {
    expect(isConcertBannerActive(new Date('2026-09-19T23:59:59+09:00'))).toBe(true);
  });

  it('공연 다음 날(KST) 0시부터는 숨긴다', () => {
    expect(isConcertBannerActive(new Date('2026-09-20T00:00:00+09:00'))).toBe(false);
  });

  it('공연 한참 뒤에도 숨긴다', () => {
    expect(isConcertBannerActive(new Date('2026-10-01T00:00:00+09:00'))).toBe(false);
  });
});
